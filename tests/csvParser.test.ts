import * as path from 'path';
import { parseReviews } from '../src/phase1/ingestor/csvParser';

describe('CSV Parser Unit Tests', () => {
  const sampleCsvPath = path.join(__dirname, 'fixtures', 'sample_reviews.csv');
  // Use a fixed reference date matching our test dataset
  const referenceDate = new Date('2026-05-22T00:00:00Z');

  it('should parse valid reviews and apply 8-12 week date filtering when explicitly requested', async () => {
    const reviews = await parseReviews({
      filePath: sampleCsvPath,
      weeksWindowStart: 12,
      weeksWindowEnd: 8,
      referenceDate
    });

    expect(reviews.length).toBeGreaterThan(0);

    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    const nowMs = referenceDate.getTime();
    const earliestMs = nowMs - 12 * msInWeek;
    const latestMs = nowMs - 8 * msInWeek;

    for (const review of reviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      
      const timeMs = review.date.getTime();
      expect(timeMs).toBeGreaterThanOrEqual(earliestMs);
      expect(timeMs).toBeLessThanOrEqual(latestMs);

      const wordCount = review.text.split(/\s+/).filter(w => w.length > 0).length;
      expect(wordCount).toBeGreaterThanOrEqual(6);

      const isEnglishAndNoEmoji = /^[\x20-\x7E\n\r\t\u2018\u2019\u201C\u201D\u2026\u2013\u2014]+$/.test(review.text);
      expect(isEnglishAndNoEmoji).toBe(true);
    }
  });

  it('should parse valid reviews up to the present (0-12 week date filtering) by default', async () => {
    const reviews = await parseReviews({
      filePath: sampleCsvPath,
      weeksWindowStart: 12,
      referenceDate
    });

    expect(reviews.length).toBeGreaterThan(0);
    
    const wordCount = reviews[0].text.split(/\s+/).filter(w => w.length > 0).length;
    expect(wordCount).toBeGreaterThanOrEqual(6);
  });

  it('should throw an error for non-existent files', async () => {
    await expect(
      parseReviews({
        filePath: path.join(__dirname, 'fixtures', 'does_not_exist.csv'),
        referenceDate
      })
    ).rejects.toThrow('File not found');
  });
});

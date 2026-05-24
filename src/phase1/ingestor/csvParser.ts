import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { RawReview } from '../../types';

export interface ParseOptions {
  filePath: string;
  weeksWindowStart?: number; // default 12 (earliest)
  weeksWindowEnd?: number;   // default 0 (latest)
  referenceDate?: Date;      // default now
}

export function parseReviews(options: ParseOptions): Promise<RawReview[]> {
  return new Promise((resolve, reject) => {
    try {
      const {
        filePath,
        weeksWindowStart = 12,
        weeksWindowEnd = 0,
        referenceDate = new Date()
      } = options;

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();

      let rawRecords: any[] = [];

      if (ext === '.json') {
        rawRecords = JSON.parse(fileContent);
        if (!Array.isArray(rawRecords)) {
          throw new Error('JSON review file must contain an array of objects.');
        }
      } else {
        // Assume CSV
        rawRecords = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      }

      // Calculate time windows
      const nowMs = referenceDate.getTime();
      const msInWeek = 7 * 24 * 60 * 60 * 1000;
      const earliestMs = nowMs - weeksWindowStart * msInWeek;
      const latestMs = nowMs - weeksWindowEnd * msInWeek;

      const reviews: RawReview[] = [];

      for (const record of rawRecords) {
        // Map columns with potential casing and synonym variations
        const ratingVal = record.rating ?? record.Rating ?? record['Star Rating'] ?? record.stars ?? record.Stars;
        const titleVal = record.title ?? record.Title ?? record['Review Title'] ?? '';
        const textVal = record.text ?? record.Text ?? record.body ?? record.Body ?? record.content ?? record.Content ?? record['Review Text'] ?? '';
        const dateVal = record.date ?? record.Date ?? record['Review Date'] ?? record['Submission Date'] ?? record.timestamp ?? record.Timestamp;
        const appVersionVal = record.appVersion ?? record['App Version'] ?? record.version ?? record.Version;

        if (ratingVal === undefined || dateVal === undefined) {
          // Skip invalid records missing rating or date
          continue;
        }

        const rating = parseInt(String(ratingVal), 10);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          continue;
        }

        const date = new Date(String(dateVal));
        if (isNaN(date.getTime())) {
          continue;
        }

        // Filter by date window
        const timeMs = date.getTime();
        if (timeMs < earliestMs || timeMs > latestMs) {
          continue;
        }

        const textValStr = String(textVal).trim();
        
        // Keep reviews with at least 6 words
        const wordCount = textValStr.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 6) {
          continue;
        }

        // Keep only English language and exclude emojis (printable ASCII + common smart punctuation)
        const isEnglishAndNoEmoji = /^[\x20-\x7E\n\r\t\u2018\u2019\u201C\u201D\u2026\u2013\u2014]+$/.test(textValStr);
        if (!isEnglishAndNoEmoji) {
          continue;
        }

        reviews.push({
          rating,
          title: String(titleVal).trim(),
          text: textValStr,
          date,
          appVersion: appVersionVal ? String(appVersionVal).trim() : undefined
        });
      }

      resolve(reviews);
    } catch (error) {
      reject(error);
    }
  });
}

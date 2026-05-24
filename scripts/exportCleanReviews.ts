import * as fs from 'fs';
import * as path from 'path';
import { parseReviews } from '../src/ingestor/csvParser';

async function exportCleanReviews() {
  const inputPath = path.join(__dirname, '..', 'tests', 'fixtures', 'sample_reviews.csv');
  const outputPath = path.join(__dirname, '..', 'tests', 'fixtures', 'clean_reviews.csv');
  const referenceDate = new Date('2026-05-22T00:00:00Z');

  try {
    console.log(`Parsing and cleaning reviews from ${inputPath}...`);
    // Getting all valid clean reviews for 0-13 weeks, or exactly the 8-12 weeks?
    // User wants "all the clean data". We can just save the 8-12 weeks target window,
    // or all valid ones up to 13 weeks. Let's do 13 to 0 weeks to get all 2,607 clean records.
    const cleanReviews = await parseReviews({
      filePath: inputPath,
      weeksWindowStart: 13,
      weeksWindowEnd: 0,
      referenceDate
    });

    let csvContent = 'rating,title,date,appVersion,text\n';
    
    for (const r of cleanReviews) {
      const title = `"${(r.title || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const text = `"${(r.text || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const date = r.date.toISOString().split('T')[0];
      const version = r.appVersion || 'Unknown';
      
      csvContent += `${r.rating},${title},${date},${version},${text}\n`;
    }

    const jsonOutputPath = path.join(__dirname, '..', 'tests', 'fixtures', 'clean_reviews.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(cleanReviews, null, 2), 'utf-8');

    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    console.log(`Successfully saved ${cleanReviews.length} clean reviews to ${outputPath} and ${jsonOutputPath}`);
  } catch (err) {
    console.error('Failed to export clean reviews:', err);
  }
}

exportCleanReviews();

import * as path from 'path';
import { ingestReviews } from './ingestor';

async function run() {
  const filePath = path.join(__dirname, '..', '..', 'tests', 'fixtures', 'sample_reviews.csv');
  // Use the reference date matching our test data
  const referenceDate = new Date('2026-05-22T00:00:00Z');

  console.log(`[Phase 1 Run] Ingesting reviews from: ${filePath}`);
  console.log(`[Phase 1 Run] Reference Date: ${referenceDate.toISOString()}`);

  try {
    const reviews = await ingestReviews({
      filePath,
      referenceDate,
      weeksWindowStart: 12,
      weeksWindowEnd: 0
    });

    console.log('\n--- Ingestion & Sanitization Results ---');
    console.log(`Successfully ingested and sanitized ${reviews.length} review(s).\n`);
    console.log(JSON.stringify(reviews, null, 2));
  } catch (error) {
    console.error('[Phase 1 Run] Error running Phase 1 Ingestion:', error);
  }
}

run();

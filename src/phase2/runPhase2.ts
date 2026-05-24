import * as fs from 'fs';
import * as path from 'path';
import { analyzeReviews } from './analyzer';
import { RawReview } from '../types';

async function run() {
  const filePath = path.join(__dirname, '..', '..', 'tests', 'fixtures', 'clean_reviews.json');
  console.log(`[Phase 2 Run] Loading clean reviews from: ${filePath}`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const reviews: RawReview[] = JSON.parse(rawData);
    
    // We can restrict the number of reviews to test the Map-Reduce safely.
    // The user requested to build it for 1000 reviews max.
    const sampleReviews = reviews.slice(0, 1000);
    console.log(`[Phase 2 Run] Read ${reviews.length} reviews. Taking top ${sampleReviews.length} for analysis.`);

    const result = await analyzeReviews(sampleReviews);

    console.log('\n--- Final Analysis Results (Weekly Pulse) ---');
    console.log(JSON.stringify(result, null, 2));

    // Save the results to the outputs folder
    const outputsDir = path.join(__dirname, '..', '..', 'outputs');
    if (!fs.existsSync(outputsDir)) {
      fs.mkdirSync(outputsDir, { recursive: true });
    }
    const outputPath = path.join(outputsDir, 'weekly_pulse_summary.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n[Phase 2 Run] Results have been successfully saved to: ${outputPath}`);

  } catch (error) {
    console.error('[Phase 2 Run] Error running Phase 2 Analysis:', error);
  }
}

run();

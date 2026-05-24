import * as path from 'path';
import * as fs from 'fs';
import { ingestReviews } from './phase1/ingestor';
import { analyzeReviews } from './phase2/analyzer';
import { exportWeeklyPulse } from './phase3/mcp';

// Basic CLI Argument Parser
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    filePath: '',
    maxReviews: 1000,
    startWeek: 12,
    endWeek: 0,
    referenceDate: new Date()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        config.filePath = args[++i];
        break;
      case '--max':
        config.maxReviews = parseInt(args[++i], 10);
        break;
      case '--start-week':
        config.startWeek = parseInt(args[++i], 10);
        break;
      case '--end-week':
        config.endWeek = parseInt(args[++i], 10);
        break;
      case '--reference-date':
        config.referenceDate = new Date(args[++i]);
        break;
    }
  }

  return config;
}

async function main() {
  console.log('================================================');
  console.log('🚀 App Review Insights Analyser - Orchestrator');
  console.log('================================================\n');

  const config = parseArgs();

  if (!config.filePath) {
    console.error('❌ Error: Missing required argument --file <path>');
    process.exit(1);
  }

  const absoluteFilePath = path.resolve(config.filePath);
  if (!fs.existsSync(absoluteFilePath)) {
    console.error(`❌ Error: File not found at ${absoluteFilePath}`);
    process.exit(1);
  }

  try {
    const totalTimeStart = Date.now();

    // ----------------------------------------------------
    // PHASE 1: Ingestion
    // ----------------------------------------------------
    console.log('\n--- [1/3] Phase 1: Ingestion ---');
    const phase1Start = Date.now();
    const allReviews = await ingestReviews({
      filePath: absoluteFilePath,
      referenceDate: config.referenceDate,
      weeksWindowStart: config.startWeek,
      weeksWindowEnd: config.endWeek
    });
    const phase1End = Date.now();
    console.log(`✅ Phase 1 complete in ${((phase1End - phase1Start) / 1000).toFixed(2)}s`);
    console.log(`   Ingested ${allReviews.length} reviews matching date bounds.\n`);

    if (allReviews.length === 0) {
      console.warn('⚠️ No reviews found to analyze. Exiting.');
      return;
    }

    // ----------------------------------------------------
    // PHASE 2: Analysis
    // ----------------------------------------------------
    console.log('--- [2/3] Phase 2: Analysis (LLM) ---');
    const phase2Start = Date.now();
    
    // Apply max bounds
    const reviewsToAnalyze = allReviews.slice(0, config.maxReviews);
    if (reviewsToAnalyze.length < allReviews.length) {
      console.log(`   Capping analysis to ${config.maxReviews} reviews to respect rate limits.`);
    }

    const pulse = await analyzeReviews(reviewsToAnalyze);
    const phase2End = Date.now();
    console.log(`✅ Phase 2 complete in ${((phase2End - phase2Start) / 1000).toFixed(2)}s\n`);

    // ----------------------------------------------------
    // PHASE 3: Export & Workspace Integration
    // ----------------------------------------------------
    console.log('--- [3/3] Phase 3: Workspace Export ---');
    const phase3Start = Date.now();
    await exportWeeklyPulse(pulse);
    const phase3End = Date.now();
    console.log(`✅ Phase 3 complete in ${((phase3End - phase3Start) / 1000).toFixed(2)}s\n`);

    // Link backend output to frontend
    try {
      const sourceData = path.resolve(__dirname, '..', 'outputs', 'weekly_pulse_summary.json');
      const targetData = path.resolve(__dirname, '..', 'frontend', 'src', 'data.json');
      if (fs.existsSync(sourceData)) {
        fs.copyFileSync(sourceData, targetData);
        console.log(`✅ Frontend Dashboard Data Synced Successfully!`);
      }
    } catch (e) {
      console.warn('⚠️ Could not sync data to frontend dashboard:', e);
    }

    const totalTimeEnd = Date.now();
    
    // ----------------------------------------------------
    // FINAL REPORT
    // ----------------------------------------------------
    console.log('================================================');
    console.log('🎉 Execution Summary');
    console.log('================================================');
    console.log(`- Reviews Processed : ${reviewsToAnalyze.length} / ${allReviews.length}`);
    console.log(`- Ingestion Time    : ${((phase1End - phase1Start) / 1000).toFixed(2)}s`);
    console.log(`- LLM Analysis Time : ${((phase2End - phase2Start) / 1000).toFixed(2)}s`);
    console.log(`- MCP Export Time   : ${((phase3End - phase3Start) / 1000).toFixed(2)}s`);
    console.log(`- Total Runtime     : ${((totalTimeEnd - totalTimeStart) / 1000).toFixed(2)}s`);
    console.log('================================================\n');

  } catch (error: any) {
    console.error('\n🚨 FATAL PIPELINE ERROR 🚨');
    console.error(error.message);
    process.exit(1);
  }
}

main();

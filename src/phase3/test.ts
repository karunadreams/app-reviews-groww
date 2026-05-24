import * as fs from 'fs';
import * as path from 'path';
import { exportWeeklyPulse } from './mcp';

async function testPhase3() {
  const outputsDir = path.join(__dirname, '..', '..', 'outputs');
  const summaryPath = path.join(outputsDir, 'weekly_pulse_summary.json');
  
  if (!fs.existsSync(summaryPath)) {
    console.error(`Summary file not found at ${summaryPath}`);
    return;
  }

  const rawData = fs.readFileSync(summaryPath, 'utf-8');
  const pulse = JSON.parse(rawData);

  console.log('Testing exportWeeklyPulse with existing data...');
  await exportWeeklyPulse(pulse);
  console.log('Test complete.');
}

testPhase3();

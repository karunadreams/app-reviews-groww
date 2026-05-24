import * as fs from 'fs';
import * as path from 'path';
import { ReduceResult } from '../../phase2/analyzer/prompts';
import { appendPulseToDoc, draftPulseEmail } from './client';
import { loadConfig } from '../../config';

function formatPulseToMarkdown(pulse: ReduceResult): string {
  const dateStr = new Date().toISOString().split('T')[0];
  let md = `# Weekly App Review Pulse - ${dateStr}\n\n`;

  md += `## Top Themes\n\n`;
  pulse.topThemes.forEach((theme) => {
    md += `### ${theme.name}\n`;
    md += `**Description**: ${theme.description}\n\n`;
    md += `**Verbatim Quotes**:\n`;
    theme.quotes.forEach((quote) => {
      md += `- "${quote}"\n`;
    });
    md += `\n`;
  });

  md += `## Actionable Next Steps\n\n`;
  pulse.actionableSteps.forEach((step, index) => {
    md += `${index + 1}. ${step}\n`;
  });

  return md;
}

export async function exportWeeklyPulse(pulse: ReduceResult): Promise<void> {
  console.log('[Phase 3] Starting MCP Workspace Export...');
  const markdownContent = formatPulseToMarkdown(pulse);
  
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.warn('[Phase 3] Configuration missing or invalid. Falling back to local file.');
    fallbackToLocal(markdownContent);
    return;
  }

  const { targetDocId, targetEmail } = config;

  let success = true;

  // 1. Google Docs Integration
  try {
    console.log(`[Phase 3] Appending to Google Doc: ${targetDocId}`);
    const docResult = await appendPulseToDoc(targetDocId, markdownContent);
    console.log(`[Phase 3] Google Docs append successful. Result:`, docResult);
  } catch (e: any) {
    console.error(`[Phase 3] Failed to append to Google Doc: ${e.message}`);
    success = false;
  }

  // 2. Gmail Draft Integration
  try {
    console.log(`[Phase 3] Creating email draft for: ${targetEmail}`);
    const subject = `Weekly App Review Pulse - ${new Date().toISOString().split('T')[0]}`;
    const emailResult = await draftPulseEmail(targetEmail, subject, markdownContent);
    console.log(`[Phase 3] Gmail draft creation successful. Result:`, emailResult);
  } catch (e: any) {
    console.error(`[Phase 3] Failed to create email draft: ${e.message}`);
    success = false;
  }

  // 3. Fallback and Resilience
  if (!success) {
    console.warn('[Phase 3] One or more MCP integrations failed. Creating local backup.');
    fallbackToLocal(markdownContent);
  } else {
    console.log('[Phase 3] MCP Workspace Export completed successfully.');
  }
}

function fallbackToLocal(content: string) {
  const outputsDir = path.join(__dirname, '..', '..', '..', 'outputs');
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }
  const backupPath = path.join(outputsDir, 'weekly_pulse_backup.md');
  fs.writeFileSync(backupPath, content, 'utf-8');
  console.log(`[Phase 3] Local backup saved to: ${backupPath}`);
}

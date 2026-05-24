import { RawReview } from '../../types';
import { callGroqWithRetry } from './groqClient';
import {
  SYSTEM_PROMPT_MAP,
  SYSTEM_PROMPT_REDUCE,
  formatReviewsToXML,
  MapResultSchema,
  ReduceResultSchema,
  MapResult,
  ReduceResult,
} from './prompts';

const BATCH_SIZE = 150;
const DELAY_BETWEEN_BATCHES_MS = 60000; // 60 seconds

export async function analyzeReviews(reviews: RawReview[]): Promise<ReduceResult> {
  console.log(`[Analyzer] Starting analysis of ${reviews.length} reviews...`);

  // --- 1. Map Phase ---
  const allThemes: any[] = [];
  
  // Chunking
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const chunk = reviews.slice(i, i + BATCH_SIZE);
    console.log(`[Analyzer] Processing Map chunk ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(reviews.length / BATCH_SIZE)} (${chunk.length} reviews)...`);
    
    const xmlFeed = formatReviewsToXML(chunk);
    const userPrompt = `Here are the reviews to analyze:\n\n${xmlFeed}`;

    const mapResponseText = await callGroqWithRetry(SYSTEM_PROMPT_MAP, userPrompt);
    
    try {
      const parsed = JSON.parse(mapResponseText);
      const validated: MapResult = MapResultSchema.parse(parsed);
      allThemes.push(...validated.themes);
    } catch (e) {
      console.warn('[Analyzer] Failed to parse/validate Map response:', e);
    }

    // Rate limiting delay if not the last chunk
    if (i + BATCH_SIZE < reviews.length) {
      console.log(`[Analyzer] Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s to respect rate limits...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log(`[Analyzer] Map Phase complete. Extracted ${allThemes.length} raw themes.`);

  // --- 2. Reduce Phase ---
  console.log('[Analyzer] Starting Reduce Phase synthesis...');
  const reduceUserPrompt = `Here are the themes extracted from various chunks:\n\n${JSON.stringify(allThemes, null, 2)}`;
  
  const reduceResponseText = await callGroqWithRetry(SYSTEM_PROMPT_REDUCE, reduceUserPrompt);
  
  let finalResult: ReduceResult;
  try {
    const parsed = JSON.parse(reduceResponseText);
    finalResult = ReduceResultSchema.parse(parsed);
  } catch (e) {
    console.error('[Analyzer] Failed to parse/validate final Reduce response:', e);
    throw new Error('LLM returned invalid schema for final synthesis.');
  }

  // --- 3. Validation Phase ---
  
  // 3a. Substring Quote Audit
  console.log('[Analyzer] Auditing verbatim quotes...');
  for (const theme of finalResult.topThemes) {
    theme.quotes = theme.quotes.filter(quote => {
      // Clean up minor formatting issues like surrounding quotes or weird spaces before checking
      const cleanQuote = quote.trim().replace(/^["']|["']$/g, '').trim();
      const lowerQuote = cleanQuote.toLowerCase();
      
      const exists = reviews.some(r => r.text.toLowerCase().includes(lowerQuote));
      if (!exists) {
        console.warn(`[Analyzer] HALLUCINATION DETECTED: Quote not found in source text: "${cleanQuote}"`);
        return false; // Omitting the invalid quote
      }
      return true;
    });
  }

  // 3b. Word Budget Validation
  const combinedText = [
    ...finalResult.topThemes.map(t => t.description),
    ...finalResult.actionableSteps
  ].join(' ');
  
  const wordCount = combinedText.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`[Analyzer] Final word budget: ${wordCount} words (Limit: 250).`);
  
  if (wordCount > 250) {
    console.warn('[Analyzer] WARNING: Word count exceeds 250 words! You may need a compression step.');
    // For now we just log the warning as specified in evaluation criteria
  }

  console.log('[Analyzer] Analysis complete.');
  return finalResult;
}

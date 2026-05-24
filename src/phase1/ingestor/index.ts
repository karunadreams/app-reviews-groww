import { parseReviews, ParseOptions } from './csvParser';
import { sanitizeReviews } from './piiSanitizer';
import { RawReview } from '../../types';

export interface IngestOptions extends ParseOptions {}

/**
 * Entry point for the ingestion subsystem. Loads reviews, filters them by date, 
 * and scrubs PII.
 * 
 * @param options Ingest options including filePath and window parameters
 * @returns Promise resolving to the parsed and sanitized reviews
 */
export async function ingestReviews(options: IngestOptions): Promise<RawReview[]> {
  const rawReviews = await parseReviews(options);
  const sanitizedReviews = sanitizeReviews(rawReviews);
  return sanitizedReviews;
}

export { parseReviews, ParseOptions } from './csvParser';
export { sanitizeReviewText, sanitizeReviews } from './piiSanitizer';

import { RawReview } from '../../types';

/**
 * Sanitizes a block of text by scrubbing PII: emails, phone numbers, UUIDs, and username patterns.
 * 
 * @param text The input review text to sanitize
 * @returns The scrubbed text with PII replaced by placeholders
 */
export function sanitizeReviewText(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // 1. Scrub Email Addresses
  // Matches standard email formats: user@domain.com
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');

  // 2. Scrub Phone Numbers
  // Matches formats like +1-202-555-0143, (555) 555-5555, 555-555-5555, etc.
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  sanitized = sanitized.replace(phoneRegex, '[REDACTED_PHONE]');

  // 3. Scrub UUIDs/GUIDs
  // Matches standard 36-character hexadecimal UUID format
  const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
  sanitized = sanitized.replace(uuidRegex, '[REDACTED_UUID]');

  // 4. Mask Username / Name Introductions (e.g. "I am John Doe", "I'm Jane", "User name: Jack_Store")
  // Replace "I am [Name]" or "I'm [Name]" where name is capitalized
  sanitized = sanitized.replace(/(I\s+am|I'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g, '$1 [User]');
  
  // Replace "User name: [Name]" or "Username: [Name]"
  sanitized = sanitized.replace(/(User\s+name|Username|user\s+name|username)(?:\s*:\s*|\s+)([A-Za-z0-9_-]+)/gi, '$1: [User]');

  return sanitized;
}

/**
 * Sanitizes an array of RawReview objects by scrubbing their title and text fields.
 * 
 * @param reviews Array of reviews to sanitize
 * @returns Array of sanitized reviews
 */
export function sanitizeReviews(reviews: RawReview[]): RawReview[] {
  return reviews.map(review => ({
    ...review,
    title: sanitizeReviewText(review.title),
    text: sanitizeReviewText(review.text)
  }));
}

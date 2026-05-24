import { sanitizeReviewText, sanitizeReviews } from '../src/phase1/ingestor/piiSanitizer';
import { RawReview } from '../src/types';

describe('PII Sanitizer Unit Tests', () => {
  it('should scrub email, phone numbers, UUIDs, and usernames from a text string', () => {
    const inputText = "Hey, I am John Doe. Email me at john.doe99@gmail.com or call +1-202-555-0143. My device id is 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d. User name: Jack_Store.";
    const expectedOutput = "Hey, I am [User]. Email me at [REDACTED_EMAIL] or call [REDACTED_PHONE]. My device id is [REDACTED_UUID]. User name: [User].";

    const result = sanitizeReviewText(inputText);
    expect(result).toBe(expectedOutput);
  });

  it('should sanitize raw review arrays', () => {
    const rawReviews: RawReview[] = [
      {
        rating: 4,
        title: "I am Jane Doe",
        text: "Please contact me at jane.doe@example.com",
        date: new Date('2026-03-15')
      }
    ];

    const sanitized = sanitizeReviews(rawReviews);
    expect(sanitized[0].title).toBe("I am [User]");
    expect(sanitized[0].text).toBe("Please contact me at [REDACTED_EMAIL]");
  });
});

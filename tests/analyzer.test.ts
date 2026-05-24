import { analyzeReviews } from '../src/phase2/analyzer';
import * as groqClient from '../src/phase2/analyzer/groqClient';
import { RawReview } from '../src/types';

jest.mock('../src/phase2/analyzer/groqClient');

describe('Analyzer Unit Tests', () => {
  const mockReviews: RawReview[] = [
    { rating: 1, title: '', text: 'The login screen is broken.', date: new Date() },
    { rating: 5, title: '', text: 'Great app, very fast.', date: new Date() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully parse and validate a perfect LLM response', async () => {
    (groqClient.callGroqWithRetry as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify({
        themes: [
          { name: 'Login Issues', description: 'Users report broken login.', quotes: ['The login screen is broken.'] }
        ]
      })) // Map response
      .mockResolvedValueOnce(JSON.stringify({
        topThemes: [
          { name: 'Login Issues', description: 'Users report broken login.', quotes: ['The login screen is broken.'] },
          { name: 'Performance', description: 'App is fast.', quotes: ['Great app, very fast.'] },
          { name: 'UI', description: 'UI is nice.', quotes: [] }
        ],
        actionableSteps: ['Fix login', 'Keep it fast', 'Improve UI']
      })); // Reduce response

    const result = await analyzeReviews(mockReviews);

    expect(result.topThemes.length).toBe(3);
    expect(result.actionableSteps.length).toBe(3);
    expect(result.topThemes[0].quotes).toContain('The login screen is broken.');
  });

  it('should omit hallucinated quotes', async () => {
    (groqClient.callGroqWithRetry as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify({ themes: [] })) // Map response
      .mockResolvedValueOnce(JSON.stringify({
        topThemes: [
          { name: 'Login Issues', description: 'Desc', quotes: ['This quote is completely hallucinated and not in the source text.'] },
          { name: 'Performance', description: 'Desc', quotes: ['Great app, very fast.'] },
          { name: 'UI', description: 'Desc', quotes: [] }
        ],
        actionableSteps: ['Step 1', 'Step 2', 'Step 3']
      })); // Reduce response

    const result = await analyzeReviews(mockReviews);

    // The hallucinated quote should be removed by the validation logic
    expect(result.topThemes[0].quotes.length).toBe(0);
    // The valid quote should remain
    expect(result.topThemes[1].quotes).toContain('Great app, very fast.');
  });
});

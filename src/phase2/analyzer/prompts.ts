import { z } from 'zod';

// --- Zod Schemas ---

export const ThemeSchema = z.object({
  name: z.string(),
  description: z.string(),
  quotes: z.array(z.string()).max(3).describe("Exactly 3 verbatim quotes from the source reviews."),
});

export const MapResultSchema = z.object({
  themes: z.array(ThemeSchema).max(5).describe("Up to 5 themes extracted from this chunk."),
});

export const ReduceResultSchema = z.object({
  topThemes: z.array(ThemeSchema).length(3).describe("Exactly 3 top themes synthesized from the chunks."),
  actionableSteps: z.array(z.string()).length(3).describe("Exactly 3 actionable next steps."),
});

export type MapResult = z.infer<typeof MapResultSchema>;
export type ReduceResult = z.infer<typeof ReduceResultSchema>;

// --- System Prompts ---

export const SYSTEM_PROMPT_MAP = `You are an expert Product Manager and Data Analyst analyzing mobile app reviews.
Your task is to perform semantic clustering on the provided feed of user reviews and extract the most prominent themes.

INSTRUCTIONS:
1. Identify up to 5 main product themes (e.g., onboarding, authentication, payments, performance, UI/UX).
2. For each theme, provide a concise description (under 40 words).
3. For each theme, extract EXACTLY 3 representative customer quotes.

CRITICAL RULE FOR QUOTES:
Any quote you extract MUST be an exact, word-for-word substring of the <text> element from the reviews provided. 
Do not alter punctuation, do not fix grammar or spelling, do not summarize, and do not paraphrase. If you cannot find an exact quote, do not invent one.

OUTPUT FORMAT:
You must return a valid JSON object matching this schema:
{
  "themes": [
    {
      "name": "Theme Name",
      "description": "Short description of the theme...",
      "quotes": ["Exact quote 1", "Exact quote 2", "Exact quote 3"]
    }
  ]
}
`;

export const SYSTEM_PROMPT_REDUCE = `You are an expert Product Manager synthesizing findings from multiple chunks of app reviews.
You will be provided with a JSON array of themes that were extracted from different batches of reviews.

INSTRUCTIONS:
1. Review all the provided themes and synthesize them to identify the OVERALL TOP 3 themes based on frequency and gravity.
2. For each of the top 3 themes, provide a concise description (under 40 words).
3. Select exactly 3 of the best verbatim quotes from the provided list for each top theme. Do not modify the quotes.
4. Brainstorm exactly 3 actionable, concrete next steps aligned with these top themes (under 20 words each).

CRITICAL BUDGET LIMIT:
The combined word count of your theme descriptions and actionable steps MUST remain under 250 words total. Make it highly scannable and concise.

OUTPUT FORMAT:
You must return a valid JSON object matching this schema:
{
  "topThemes": [
    {
      "name": "Theme Name",
      "description": "Short description under 40 words.",
      "quotes": ["Quote 1", "Quote 2", "Quote 3"]
    }
  ],
  "actionableSteps": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3"
  ]
}
`;

// Helper to format reviews into compact XML for the prompt
export function formatReviewsToXML(reviews: Array<{ title: string; text: string; rating: number }>): string {
  let xml = '<reviews>\n';
  reviews.forEach((r, idx) => {
    xml += `  <r id="${idx + 1}" rating="${r.rating}">\n`;
    if (r.title) xml += `    <title>${r.title.replace(/</g, '&lt;')}</title>\n`;
    xml += `    <text>${r.text.replace(/</g, '&lt;')}</text>\n`;
    xml += `  </r>\n`;
  });
  xml += '</reviews>';
  return xml;
}

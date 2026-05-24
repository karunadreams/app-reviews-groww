import * as dotenv from 'dotenv';
import { z } from 'zod';
import { Config } from './types';

// Load .env file
dotenv.config();

const configSchema = z.object({
  GROQ_API_KEY: z.string({
    required_error: 'GROQ_API_KEY is required',
  }).min(1, 'GROQ_API_KEY cannot be empty'),
  MCP_SERVER_URL: z.string().default('https://mcp-server-production-5fd1.up.railway.app'),
  TARGET_DOC_ID: z.string({
    required_error: 'TARGET_DOC_ID is required for exporting to Google Docs',
  }),
  TARGET_EMAIL: z.string({
    required_error: 'TARGET_EMAIL is required for exporting to Gmail',
  }),
});

export function loadConfig(): Config {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Configuration validation error: ${errors}`);
  }

  const data = result.data;
  return {
    groqApiKey: data.GROQ_API_KEY,
    mcpServerUrl: data.MCP_SERVER_URL,
    targetDocId: data.TARGET_DOC_ID,
    targetEmail: data.TARGET_EMAIL,
  };
}

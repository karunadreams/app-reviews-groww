import express from 'express';
import cors from 'cors';
import { appendPulseToDoc, draftPulseEmail } from './phase3/mcp/client';
import { loadConfig } from './config';
import { marked } from 'marked';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/api/export/email', async (req, res) => {
  try {
    const { email, content } = req.body;
    if (!email || !content) {
      return res.status(400).json({ error: 'Missing email or content' });
    }

    const subject = `Weekly App Review Pulse - ${new Date().toISOString().split('T')[0]}`;
    
    // Convert Markdown to beautifully formatted HTML for Gmail with Dark Theme
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #0A0A0F; color: #f0f2f5; padding: 30px; border-radius: 12px; max-width: 800px; margin: 0 auto; border: 1px solid #ffffff10;">
        ${await marked.parse(content)}
      </div>
    `;

    await draftPulseEmail(email, subject, htmlBody);
    
    res.json({ success: true, message: 'Email draft created successfully' });
  } catch (error: any) {
    console.error('Error creating email draft:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/export/docs', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Missing content' });
    }

    const config = loadConfig();
    const docId = config.targetDocId;

    await appendPulseToDoc(docId, content);
    
    res.json({ success: true, message: 'Appended to Google Doc successfully' });
  } catch (error: any) {
    console.error('Error appending to Google Doc:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 Express API Server running on http://localhost:${PORT}`);
  console.log(`================================================`);
});

const { marked } = require('marked');

async function test() {
  console.log("Fetching MCP Server...");
  const content = `# 📊 Groww App Review Insights Analyser: Weekly Pulse\n**Date:** May 24, 2026`;
  const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #0A0A0F; color: #f0f2f5; padding: 30px; border-radius: 12px; max-width: 800px; margin: 0 auto; border: 1px solid #ffffff10;">
        ${await marked.parse(content)}
      </div>
    `;

  try {
    const res = await fetch("https://mcp-server-production-5fd1.up.railway.app/create_email_draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "karunajaiswal0119@gmail.com",
        subject: "Test from API",
        body: htmlBody
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();

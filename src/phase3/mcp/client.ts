import { loadConfig } from '../../config';

export async function appendPulseToDoc(docId: string, content: string): Promise<any> {
  const config = loadConfig();
  const url = `${config.mcpServerUrl}/append_to_doc`;

  console.log(`[MCP Client] Sending request to ${url} for docId: ${docId}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      doc_id: docId,
      content,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to append to doc. Status: ${response.status}. Error: ${errorText}`);
  }

  const json = await response.json() as any;
  if (json.status === 'error') {
    throw new Error(`Doc append error: ${json.message} - ${json.details || ''}`);
  }

  return json;
}

export async function draftPulseEmail(to: string, subject: string, body: string): Promise<any> {
  const config = loadConfig();
  const url = `${config.mcpServerUrl}/create_email_draft`;

  console.log(`[MCP Client] Sending request to ${url} for email: ${to}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      subject,
      body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create email draft. Status: ${response.status}. Error: ${errorText}`);
  }

  const json = await response.json() as any;
  if (json.status === 'error') {
    throw new Error(`Email draft error: ${json.message} - ${json.details || ''}`);
  }

  return json;
}

async function test() {
  console.log("Fetching MCP Server...");
  const res = await fetch("https://mcp-server-production-5fd1.up.railway.app/send_email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "karunajaiswal0119@gmail.com",
      subject: "Test from API",
      body: "Test Body"
    })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
test();

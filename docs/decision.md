# App Review Insights Analyser - Architectural Decisions

This document tracks the major technical and logical decisions made during the design and development of the **App Review Insights Analyser**, formatted as Architectural Decision Records (ADRs).

---

## ADR 1: Model Context Protocol (MCP) over Direct REST APIs

### Status
Accepted

### Context
Integrating Google Workspace (Google Docs and Gmail) typically requires creating a developer project in the Google Cloud Console, configuring OAuth2 consent screens, handling user redirect credentials, writing token refresh loops, and utilizing platform-specific API client libraries. This results in heavy boilerplate, potential token leakage, and maintenance overhead.

### Decision
Use **Model Context Protocol (MCP)** servers (`google-docs` and `gmail` MCP servers) to interact with Google Workspace. The host application connects as an MCP client and uses standard tool-calling protocol schemas over stdio.

### Consequences
* **Positive**:
  * Minimal integration code: We do not need to configure OAuth or handle credentials/tokens in our core repository.
  * Extensibility: If we swap or add platforms (e.g. Slack, Notion), we can plug in another MCP server without changing our orchestration core.
  * Standardized format: Communication is structured as simple, unified JSON-RPC calls.
* **Negative**:
  * Reliance on the availability and maintenance of external/local MCP servers.
* **Risks & Mitigations**:
  * *Risk*: Debugging tool execution failures can be harder because errors are mediated through the MCP connection.
  * *Mitigation*: Detailed error logging on the client side and fallback logic to output local markdown files when MCP servers are unreachable.

---

## ADR 2: Runtime Environment Selection (TypeScript / Node.js)

### Status
Accepted

### Context
The application needs a language runtime that supports CLI interactions, file system operations (parsing JSON/CSV exports), interfacing with LLM APIs, and establishing MCP client connections.

### Decision
Use **Node.js with TypeScript** as the main application stack.

### Consequences
* **Positive**:
  * Excellent first-party support for the Anthropic MCP TypeScript SDK (`@modelcontextprotocol/sdk`).
  * Strong typing prevents schema mismatch bugs in CSV parsing and LLM outputs.
  * Lightweight runtime footprint.
* **Negative**:
  * Node.js does not have native data-science/clustering library support like Python (e.g. `pandas`, `scikit-learn`).
* **Risks & Mitigations**:
  * *Risk*: High dependency on NPM packages which could get deprecated.
  * *Mitigation*: Keep dependencies minimal (e.g., use native node APIs for JSON parsing, basic `csv-parse` for CSVs). Since clustering is delegated to a frontier LLM (Groq), complex data-science packages are not needed.

---

## ADR 3: LLM-Based Theme Clustering & Summary

### Status
Accepted

### Context
Ingested review reviews must be clustered into $\le$ 5 themes and condensed. Traditional clustering methods (K-means, LDA) require extensive configuration, training data, and linguistic tokenizers.

### Decision
Outsource theme clustering, quotes selection, and recommendation generation directly to Groq via structured prompt engineering.

### Consequences
* **Positive**:
  * Zero model hosting cost and setup.
  * Superior semantic understanding, accommodating slang, typos, and multi-lingual review feedback.
  * Highly customizable output formatting.
* **Negative**:
  * Potential for LLM hallucinations (specifically, inventing quotes or fabricating data).
* **Risks & Mitigations**:
  * *Risk*: Hallucinatory quotes in reports could damage credibility.
  * *Mitigation*: Programmatically check all quotes returned by the LLM to verify that they match exact substrings in the source reviews. Reject and retry the LLM call or flag quotes that do not match.

---

## ADR 4: Pre-LLM PII Sanitization via Local RegEx

### Status
Accepted

### Context
User reviews sometimes contain Personally Identifiable Information (PII) like names, email addresses, phone numbers, or device IDs. Sending raw reviews containing PII to external LLM APIs poses security and privacy risks.

### Decision
Sanitize and redact PII locally *before* sending reviews to the Groq API. We will use a deterministic, local RegEx-based sanitizer rather than relying on the LLM to filter them.

### Consequences
* **Positive**:
  * Data privacy: PII is removed locally, meaning zero PII leaves the user's system.
  * Predictability: RegEx is deterministic, fast, and does not cost LLM API tokens.
* **Negative**:
  * RegEx patterns might miss edge cases (e.g., highly unusual username or email formats).
* **Risks & Mitigations**:
  * *Risk*: Complex text might bypass simple regex rules.
  * *Mitigation*: Combine Regex matches for standard patterns (emails, phone numbers, UUIDs) with a username masking layer that checks review metadata.

---

## ADR 5: Standardizing on Groq Structured JSON Outputs

### Status
Accepted

### Context
The Orchestrator must reliably extract themes, word counts, and quotes from the LLM output. Parsing raw markdown text from LLM outputs using Regex or string splitting is error-prone and fragile.

### Decision
Utilize the Groq API's Structured Output capabilities (JSON mode or schema enforcement) by passing a strict schema. This forces the model to return a syntactically correct JSON object matching our interface.

### Consequences
* **Positive**:
  * Eliminates parsing errors due to markdown headers or conversational text wrapper changes.
  * Allows direct instantiation of typed TypeScript interfaces.
* **Negative**:
  * Slightly higher latency as the model conforms to schema constraints.
* **Risks & Mitigations**:
  * *Risk*: Schema validation might fail if the model fails to conform.
  * *Mitigation*: Wrap the Groq API client execution in a try-catch block and implement retry logic.

---

## ADR 6: Stdio Subprocess Communication for MCP Servers

### Status
Accepted

### Context
Model Context Protocol supports both Server-Sent Events (SSE) over HTTP and standard input/output (stdio) over local subprocesses. The host application runs locally on developer systems and needs to connect to local Workspace servers.

### Decision
Standardize on the stdio subprocess transport protocol to communicate with local MCP servers.

### Consequences
* **Positive**:
  * Zero port configuration: No need to allocate HTTP ports or manage firewalls.
  * Simple lifecycle: The child subprocess naturally terminates when the host application exits.
  * Security: Communication is local and piped, preventing intercept over network loops.
* **Negative**:
  * Logging overhead: Any standard log writes by the server process onto `stdout` will break JSON-RPC parsing.
* **Risks & Mitigations**:
  * *Risk*: Host app crashes if JSON-RPC parses invalid non-JSON output from standard streams.
  * *Mitigation*: Enforce that the MCP server writes all internal logs and traces to `stderr` and instruct the host client to route `stderr` to a local logging file.

---

## ADR 7: Graceful Local Fail-safe Fallback

### Status
Accepted

### Context
Interfacing with external Workspace API integrations can fail due to token expiry, API rate limits, network loss, or scope refusal. If the application crashes during the final output delivery step, the LLM execution is wasted, generating unnecessary latency and API costs.

### Decision
Implement a local fallback mechanism that writes the structured "Weekly Pulse" summary directly as a Markdown document to a local directory if the MCP tool execution fails.

### Consequences
* **Positive**:
  * Cost efficiency: No wasted LLM costs if the failure is purely downstream.
  * Data durability: The analysis is preserved, letting developers manually inspect it or retry delivery.
* **Negative**:
  * Extra code path to maintain for local file writing.
* **Risks & Mitigations**:
  * *Risk*: The user is unaware of the delivery failure.
  * *Mitigation*: Print prominent warnings in the console showing the exact path of the local backup and the specific error caught from the MCP server.

---

## ADR 8: Local Regex Sanitizer vs. LLM-based Pre-scrubbing

### Status
Accepted

### Context
Scrubbing PII could be done by sending raw text to a small LLM model first or requesting the main LLM to ignore PII. However, sending raw data containing PII to a cloud service, even for the purpose of scrubbing it, violates basic privacy boundaries.

### Decision
Perform sanitization strictly inside the local runtime boundary using compiled Regex.

### Consequences
* **Positive**:
  * Privacy compliance: Sensitive data is zeroed out before leaving the machine boundary.
  * Speed: Regular expressions run in microseconds, avoiding LLM execution delays.
  * Cost: Regex processing consumes zero API tokens.
* **Negative**:
  * Lack of semantic understanding: Regex cannot easily determine context (e.g. distinguishing a standard user name from an address in a complex sentence).
* **Risks & Mitigations**:
  * *Risk*: Hardcoded regex misses specific, non-standard PII formats.
  * *Mitigation*: Apply conservative, broad regex matches (e.g., standard email, telephone, UUID) and mask all review authors by default.

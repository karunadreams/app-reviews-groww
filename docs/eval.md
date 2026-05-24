# App Review Insights Analyser - Evaluation Framework

This document outlines the testing methodologies, test datasets, validation assertions, and exit criteria required to verify and sign off on each implementation phase.

---

## Phase 1 Evaluation: Foundation & Ingestion

### 1. Test Dataset Specifications
Unit tests must run against the following mock reviews to verify correct date filtering and PII sanitization.

* **Date Filtering Test Case**:
  * Run date: `2026-05-22`
  * Valid review (within 8-12 weeks window): Date `2026-03-15` (approx 10 weeks ago) -> **Include**
  * Out of window (newer than 8 weeks): Date `2026-04-20` (approx 4.5 weeks ago) -> **Exclude**
  * Out of window (older than 12 weeks): Date `2026-01-10` (approx 19 weeks ago) -> **Exclude**

* **PII Sanitization Test Case**:
  * Input text: `"Hey, I am John Doe. Email me at john.doe99@gmail.com or call +1-202-555-0143. My device id is 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d. User name: Jack_Store."`
  * Expected output text: `"Hey, I am [User]. Email me at [REDACTED_EMAIL] or call [REDACTED_PHONE]. My device id is [REDACTED_UUID]. User name: [User]."`

### 2. Exit Criteria Checklists
- [ ] **Date Window Enforcement**: Verify that reviews outside the 8-12 weeks range are ignored.
- [ ] **PII Scrubbing Integrity**: RegEx patterns match and replace all emails, phone numbers, and UUIDs.
- [ ] **Username Masking**: Usernames in titles/text and author fields are masked with `[User]`.
- [ ] **Test Coverage**: Run `npm run test` or `npx jest tests/csvParser.test.ts` and confirm 100% of parser test assertions pass.

---

## Phase 2 Evaluation: Analysis & Summarization

### 1. Verification Scripts & Rules
The analysis module must include programmatic validations of the LLM JSON response before passing it to the MCP client:

* **Theme Count Constraint**:
  * Check: `AnalysisOutput.themes.length <= 5`.
  * Check: `AnalysisOutput.weeklyPulse.topThemes.length === 3`.
* **Verbatim Quotes Check**:
  * Loop through every quote in `AnalysisOutput.weeklyPulse.topThemes[*].quotes`.
  * Assert that each quote exists as a substring (case-insensitive, ignoring minor white space differences) in the array of sanitized reviews.
* **Length Constraint Check**:
  * Combine the text of all theme summaries and action items in `AnalysisOutput.weeklyPulse`.
  * Run a word-counter function: `wordCount(combinedText) <= 250`.

### 2. Exit Criteria Checklists
- [ ] **JSON Schema Validation**: The response matches the defined Zod schema without errors.
- [ ] **Zero Hallucinated Quotes**: Automated substring matching confirms all quotes are authentic.
- [ ] **Theme Limit Enforcement**: Exactly 3 top themes are reported out of $\le$ 5 categorized themes.
- [ ] **Scannability / Length check**: Combined content is verified to be $\le$ 250 words.

---

## Phase 3 Evaluation: MCP Integration

### 1. Integration Verification Steps
* **MCP Dry-Run Mode**:
  * Implement a flag: `npm start -- --dry-run` or similar.
  * In dry-run mode, the MCP Client establishes a connection, prints available tools to the console, but does not execute changes, OR it runs against a local mock server.
* **Tool Discovery Audit**:
  * Log the names of all tools returned by the MCP servers.
  * Confirm that `create_document` and `create_draft_email` (or equivalent target server tools) are available in the tool list.
* **Write Operations Verification**:
  * Execute the creation of a temporary test document.
  * Confirm that the return values contain a valid, openable document URL.

### 2. Exit Criteria Checklists
- [ ] **Successful Handshake**: Connection protocol is established and logged without errors.
- [ ] **Workspace Tool Access**: Tool list inspection confirms GDocs and Gmail operations are available.
- [ ] **No Direct Auth Plumbery**: Confirm no OAuth secrets, access tokens, or refresh logic are present in our application repository.
- [ ] **Graceful Failures**: Verify that if the MCP server is shut down, the program outputs a local file (`weekly-pulse.md`) instead of throwing an uncaught exception.

---

## Phase 4 Evaluation: End-to-End Execution

### 1. Command Verification
Run the end-to-end flow with a single terminal command:
```bash
npm start -- --file ./tests/fixtures/sample_reviews.csv
```

### 2. Visual Output Audit
* **Google Doc**:
  * Open the created document link.
  * Confirm it is well-formatted: has a title, clear subheadings for the 3 themes, bulleted lists for quotes, and a numbered list for next steps.
  * Verify that the entire content fits easily on a single page when converted to PDF or printed.
* **Gmail Draft**:
  * Open your Gmail Drafts folder.
  * Confirm the draft exists with:
    * Subject: `App Review Weekly Pulse - [Date Range]`
    * Recipient: User's own email.
    * Body: Contains the short summaries of the top themes and a direct link to the Google Doc.

### 3. Exit Criteria Checklists
- [ ] Pipeline runs end-to-end using a single command.
- [ ] Performance logs show the process completes within 30 seconds.
- [ ] Final Google Doc and Gmail draft conform strictly to style and privacy guidelines.

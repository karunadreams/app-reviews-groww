# App Review Insights Analyser - Phase-wise Implementation Plan

This document outlines the detailed roadmap for building the **App Review Insights Analyser**. Each phase is broken down into precise, step-by-step logical tasks, inputs, outputs, edge cases, and verification steps. No code snippets or implementation syntax are included here; this document outlines the conceptual and procedural blueprint of what is being built.

---

## Phase 1: Foundation & Local Ingestion

**Goal**: Establish the workspace structure, configure toolchains, build local environment validators, and implement the local review parsing and sanitization modules.

### Milestone 1.1: Project Setup and Configuration
1. **Initialize Project Metadata**: Initialize the project directory with standard configurations to target Node.js runtimes. Ensure strict module rules are applied.
2. **Setup Compile Configurations**: Create configuration profiles defining module resolution strategies, target language specifications (targeting ES2022 compatibility), and strict type validation parameters.
3. **Environment Setup**: Define configuration templates and guidelines containing settings for API keys, local paths for Model Context Protocol (MCP) servers, and default date windows.
4. **Git Settings**: Maintain standard exclusions for compiled directories, build outputs, environment configurations, and local Workspace credentials.

### Milestone 1.2: Local Ingestion Module
1. **Data Collection**: Use `google-play-scraper` to pull real-world app reviews programmatically, paginating chronologically.
2. **File System Parsing**: Build file readers that resolve absolute or relative input paths and parse raw CSV/JSON reviews.
3. **Data Normalization**: 
   * Map different source columns into uniform internal structures.
   * Filter out reviews containing fewer than 6 words.
   * Filter out non-English reviews and those containing emojis using regex validations.
3. **Date Boundary Calculations**:
   * Calculate date limits dynamically based on the current system runtime time.
   * Define the start boundary at exactly $12$ weeks in the past.
   * Define the end boundary at exactly $8$ weeks in the past.
   * Exclude any review records whose parsed timestamps fall outside of this specific window.
   * Log data counts showing: raw files read, entries dropped for date bounds, and entries retained for analysis.

### Milestone 1.3: Local PII Sanitization
1. **RegEx-Based Redaction**:
   * Scrub email patterns using alphanumeric email validation rules.
   * Scrub telephone numbers including standard, international, and grouped configurations.
   * Scrub UUID/GUID formats, system hashes, and device signature structures.
   * Replace identified PII matches with standard markers: `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, and `[REDACTED_UUID]`.
2. **Username Masking**: Strip author attributes and customer names from the reviews, replacing them with a standardized `[User]` label.
3. **Privacy Separation Check**: Verify that the output array contains zero matches for sensitive data, ensuring that no customer PII will be transmitted to external API endpoints.

---

## Phase 2: Analysis & Summarization Engine

**Goal**: Establish a connection to the Groq API, construct robust prompt templates, and programmatically validate the generated theme clusters, quotes, and word budgets.

### Milestone 2.1: LLM Connector Setup
1. **Client Setup**: Configure and instantiate the Groq SDK. Ensure API keys are loaded securely from environment configurations.
2. **Connection Resilience & Token Management**: Implement connection timeout rules, exponential backoff, and strict rate-limiting delays. To comply with Groq's `llama-3.3-70b-versatile` limits (30 RPM, 12K TPM), chunk the 1000 reviews into token-safe batches (~200-250 reviews each, well under 12K tokens) and enforce a mandatory 60-second delay between batch requests during the Map phase. After all chunks are mapped to themes, execute a final Reduce prompt to merge them.
3. **Response Schema Configuration**: Set the LLM to run in Structured Output Mode, passing a formal JSON Schema. This ensures that the generated output from the API strictly conforms to the expected JSON tree, removing any preamble or markdown wrappers.

### Milestone 2.2: Prompt Engineering
1. **System Prompt Formulation**: Define the LLM's persona as an expert Product Manager and Analyst. Instruct it to:
   * Perform semantic clustering on the provided feed of reviews.
   * Restrict overall theme groupings to a maximum of five categories.
   * Select the top three themes based on review volume and gravity.
   * Brainstorm exactly three actionable, concrete next steps aligned with the top themes.
2. **Strict Verbatim Quote Extraction**: Instruct the model to extract exactly three representative customer quotes for each of the top themes. Enforce the rule that these quotes must be exact verbatim substrings from the sanitized reviews, preventing any paraphrasing or fabrication.
3. **Word Budget Limits**: Set strict word limits to ensure the total word count of the summarized sections remains under $250$ words.

### Milestone 2.3: Programmatic Output Validation
1. **Schema Check**: Confirm the parsed response contains all required fields, matching theme configurations, quote lists, and action items.
2. **Substring Quote Audit**: Programmatically scan each extracted quote, performing a case-insensitive search against the list of sanitized input reviews. If any quote fails to match an input review exactly, flag the response as invalid, trigger a retry, or discard the hallucinated text.
3. **Word Count Validation**: Calculate the combined word length of the generated weekly pulse text. If it exceeds $250$ words, flag a warning and run compression checks.

---

## Phase 3: MCP Connection & Google Workspace Integration

**Goal**: Spawn and manage child processes for the Google Workspace MCP servers, configure credentials locally, map commands to JSON-RPC tool calls, and build local fail-safe file outputs.

### Milestone 3.1: MCP Client Subprocess Management
1. **Subprocess Instantiation**: Build controllers that read MCP command configurations and spawn Google Docs and Gmail MCP servers as child processes.
2. **Stream Routing**:
   * Map standard input and standard output streams to send and receive JSON-RPC protocol messages.
   * Capture standard error streams from the server processes and redirect them to internal log files. This keeps log data from polluting the communication channels.
3. **Handshake Lifecycle**: Implement initial handshake sequences: request connection, establish capabilities, negotiate protocol versions, and retrieve lists of available tools.
4. **Shutdown Routine**: Manage process exits, closing open streams, and sending clean exit commands to child subprocesses upon pipeline completion.

### Milestone 3.2: OAuth & Credentials Configuration
1. **Scope Verification**: Verify that the local credentials and tokens allow creating files in Google Docs and drafts in Gmail.
2. **Local Authorization Handling**: Document and handle user authorization prompts. If token expirations occur, notify the user with instructions on how to re-authenticate.

### Milestone 3.3: Workspace Tool Execution
1. **Google Docs Integration**: Map variables containing the Weekly Pulse summary to the Google Docs tool parameters. Execute the document creation command, capture success confirmations, and parse out the new document ID and URL.
2. **Gmail Draft Integration**: Map variables to the Gmail tool parameters. Draft a notification email addressed to the user. Embed the Google Doc URL and the high-level pulse summaries in the email body, execute the draft creation, and capture the Draft ID.

### Milestone 3.4: Fallback and Resilience Logic
1. **Tool Error Interception**: Catch failures when servers are offline, network packets drop, or Google API limits are reached.
2. **Local Backup Output**: If the MCP Workspace delivery fails, write the generated Weekly Pulse directly to a local Markdown file under a designated output directory. Log a warning to the console detailing the backup location, ensuring that LLM results are preserved.

---

## Phase 4: Orchestration & Exit Verification

**Goal**: Coordinate all modules into a single CLI flow, record performance logs, display summary links, and execute final audit checklists.

### Milestone 4.1: CLI Interface and Input Validation
1. **Argument Parsing**: Write command-line argument parsers that handle user inputs (e.g. source file path, date window configuration overrides, dry-run flags, output folders).
2. **Path Verification**: Validate target input paths, checking that files exist and are readable before starting the process.

### Milestone 4.2: Central Orchestrator
1. **Workflow Coordination**: Build the central orchestrator that manages data handoffs between the Ingestion module, the Analysis Engine, and the MCP delivery layer.
2. **Telemetry and Timing**: Measure the execution time of each milestone and record these metrics in the application logs.
3. **Error Boundaries**: Wrap processing blocks in global catch-alls to log crashes, clean up open MCP child processes, and exit with non-zero codes on failure.

### Milestone 4.3: Terminal Reports & Final Auditing
1. **CLI Summary Display**: Format success logs to show performance metrics, active indicators, and final links (Google Doc URL, Gmail Draft ID, or backup file paths).
2. **Exit Check Audit**: Execute the verification tests defined in the evaluation framework, ensuring all criteria are verified before completing a run.

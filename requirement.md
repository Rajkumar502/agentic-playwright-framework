# Architecture Design Document: Autonomous Agentic SDLC & Playwright Framework

## 1. Executive Summary

This framework bridges modern test automation with generative AI and autonomous CI/CD workflows. Traditional software development and test maintenance suffer from brittle locators, hardcoded test data, bloated script duplication, manual code reviews, and manual tracking overhead. This architecture solves those challenges by implementing strict separation of concerns, an autonomous code-generation pipeline, a runtime element self-healing proxy, code quality/regression gates, intelligent root cause analysis, automated triage actions, and bi-directional project management synchronization.

---

## 2. Core Architectural Principles

### A. Strict Page Object Model (POM) with BasePage

- **BasePage Inheritance** — All page objects extend a common `BasePage` class, centralizing navigation and baseline browser operations (DRY principle).
- **Lazy Getters** — Locators are defined using TypeScript getters (`private get element() { return this.page.locator(...) }`). This defers element evaluation until interaction time, preventing initialization crashes and integrating cleanly with dynamic proxies.
- **Encapsulation** — Test specs are completely decoupled from raw locators. All element interactions and assertions are encapsulated inside public page methods.

### B. Centralized Test Data Store
**File:** `src/data/test-data.ts`

- Eliminates hardcoded inline strings across test specs.
- Acts as a single source of truth for user credentials, form inputs, and expected validation messages.

### C. Non-Destructive Agentic Generation & Self-Healing Code Loop

- **Model Choice** — Powered by **Gemini Flash-Lite**, optimizing for low latency, high throughput, and exceptional token economy.
- **Context Analysis** — The `GeneratorAgent` analyzes existing page objects and data stores before writing code.
- **Self-Healing Compilation Loop** — If generated code fails TypeScript type-checking (`tsc --noEmit`), the compiler error is captured, fed back into Gemini as context, and automatically retried (up to 3 times) until structural code integrity is achieved.

### D. Autonomous Self-Healing Proxy Fixture (Runtime)

- Intercepts Playwright locator calls at runtime.
- When a UI selector changes or breaks during execution, the proxy leverages AI heuristics and local caching (`healing-cache.json`) to dynamically repair broken locators without failing the test suite.

### E. Code Quality, Regression, and Review Gates

- **Type-Checking Gate** — Enforces strict structural code standards via TypeScript compilation.
- **Regression Gate** — Executes the full Playwright test suite to catch side effects or locator collisions before code promotion.
- **Review & Merge Gate** — Automatically isolates work in feature branches, opens GitHub Pull Requests via the GitHub CLI (`gh`), auto-merges verified code into `main`, and cleans up branches.

### F. Token Economy, Cost Tracking & FinOps Dashboard

- **Targeted Context Injection** — Restricts prompt payloads to necessary modules to prevent token bloat.
- **Real-Time Token Logger & Audit** (`TokenLogger`) — Calculates estimated input/completion token counts and fractional execution costs after every generation run, persisting records to `token-audit.json`.
- **Automated FinOps Dashboard** — Dynamically compiles and updates `FINOPS-DASHBOARD.md` with executive summaries, execution logs, and cumulative spending metrics.

### G. Autonomous Self-Healing Maintenance Agent & Human-in-the-Loop Governance

While the runtime proxy handles unexpected UI drift dynamically via `healing-cache.json` to keep tests passing, long-term technical debt requires source code refactoring.

- **Telemetry-Driven Refactoring** — The maintenance agent (`maintenance-agent.ts`) periodically reads the local healing cache telemetry.
- **Isolated Patching** — It spins up a maintenance branch, delegates source code updates for affected `.page.ts` files to Gemini, and verifies integrity using the standard TypeScript and Playwright regression gates.
- **Strict Human-in-the-Loop Gate** — Unlike feature generation (which auto-merges on success), maintenance PRs intentionally halt without auto-merging. This enforces a mandatory human review and sign-off gate to verify that DOM modifications were mapped accurately before code promotion to `main`.

### H. Token Budgeting & Cost Circuit Breakers

- **Cost Governance** — Cumulative token counts and fractional costs are calculated in real-time via the `TokenLogger` utility.
- **Circuit Breaker Ceiling** — If an iterative self-healing or generation loop breaches the safety cost threshold (e.g., $0.05 USD per run), the circuit breaker triggers immediately, safely aborting the pipeline to prevent runaway LLM costs.

### I. Intelligent Failure Classification (AI Root Cause Analysis) & Autonomous Triage

- **Automated Diagnostics** — When regression suites fail, the RCA engine inspects execution logs and stack traces.
- **Failure Categorization** — Dynamically classifies failures into actionable buckets: (1) Brittle Locator Drift, (2) True Application Bugs / Assertion Mismatches, or (3) Environmental / Network Flakes.
- **Autonomous Remediation Actions:**
  - **True Application Bugs** — Autonomously creates a structured Jira Bug Ticket linked to the failure context for engineering investigation.
  - **Environmental Flakes** — Automatically quarantines the unstable test by moving it to `src/tests/quarantine/` and creates a Jira ticket for infrastructure/stability review, preventing pipeline blockages.

### J. Modern Playwright Architecture & Code Quality Standards

To ensure that autonomous feature generation does not introduce technical debt or legacy anti-patterns, the agentic prompt architecture enforces strict engineering rules:

- **Web-First Assertion Standard** — Manual boolean checks (like `.isVisible()`) are strictly prohibited in favor of auto-retrying web-first assertions.
- **Resilient Locator Strategy** — Locators rely on semantic properties (`getByRole`, `getByTestId`, `getByLabel`) rather than volatile DOM structure selectors.
- **Encapsulated Component Composition (POM)** — Page objects utilize TypeScript lazy getters and extend a shared `BasePage`, keeping test specs concise and focused purely on business user journeys (DRY principle).
- **Automated Type Integrity** — TypeScript strict mode and typing constraints are enforced programmatically before any quality gates or regression checks run.

### K. Autonomous Coverage Gap Analysis Agent & Backlog Auditing

To move from reactive testing to proactive quality engineering, the framework includes a coverage gap audit engine:

- **Backlog-to-Repository Cross-Referencing** — Periodically or on-demand, the agent fetches active tasks from the Jira backlog via modern JQL search endpoints and maps them against local spec definitions.
- **AI QA Directorship** — Gemini analyzes requirement complexity and existing test files to calculate coverage footprints and flag unautomated business capabilities.
- **Proactive Pipeline Triggering** — When a coverage gap is detected, the agent autonomously invokes the SDLC generation pipeline to close the gap before manual assignment.

### L. Multi-Agent Code Review & Governance Gate (ReviewerAgent)

- **Separation of Concerns** — The framework separates the creation role (`GeneratorAgent`) from the auditing role (`ReviewerAgent`).
- **Jira Acceptance Criteria Traceability** — Cross-references the generated test code against the specific business expectations and acceptance criteria described in the Jira ticket.
- **Automated Peer Review** — Automatically runs static heuristic and LLM evaluations on generated specs, rejecting anti-patterns (hardcoded waits, manual boolean assertions, or missing business logic) before code reaches human review or repository commit.

---

## 3. Data Flow & Execution Lifecycle

1. **Requirement Ingestion** — User provides a Jira ticket ID (e.g., `SCRUM-1`) via the CLI (`requirement-to-test.ts`).
2. **Jira Fetching & Branching** — The framework fetches ticket metadata and acceptance criteria from Jira, slugifies the summary into a clean file name, and creates an isolated Git feature branch.
3. **AI Synthesis & Self-Healing** — Gemini Flash-Lite evaluates method requirements and generates TypeScript code. If compilation fails, the self-healing loop patches it autonomously.
4. **Multi-Agent Review & Traceability** — The `ReviewerAgent` audits code quality and verifies that all Jira acceptance criteria are thoroughly covered.
5. **Quality & Regression Validation** — Runs `tsc --noEmit` for type safety, followed by a full Playwright regression suite check.
   - **If Regression Fails (RCA):**
     - **App Bug** — Autonomously creates a Jira Bug Ticket.
     - **Flake** — Quarantines the spec to `src/tests/quarantine/` and creates a stability ticket.
6. **PR Automation & Auto-Merge** — Commits changes, pushes the branch, opens a GitHub Pull Request, and auto-merges it into `main` upon passing all gates.
7. **Bi-Directional Jira Sync & FinOps Recording** — Posts exhaustive evidence (PR links, check logs, attempt counts) back to the Jira ticket, automatically transitions it to `Done`, and records token metrics to update `FINOPS-DASHBOARD.md`.
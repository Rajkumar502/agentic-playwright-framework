# Autonomous Agentic SDLC & Playwright Framework

An enterprise-grade, autonomous software development lifecycle (SDLC) and test automation framework built with **Playwright**, **TypeScript**, and **Gemini Flash-Lite**.

This framework seamlessly bridges **Jira**, **GitHub**, and **Playwright** to execute an end-to-end autonomous loop: fetching ticket requirements, dynamically generating modular Page Object Models (POM) and test specs, enforcing strict quality gates and traceability, auto-merging Pull Requests, syncing evidence back to Jira, and tracking LLM operational costs.

---

## Modern Playwright & TypeScript Enforcement

The framework's `GeneratorAgent` is configured to strictly enforce cutting-edge test automation standards during code generation:

- **Web-First Assertions** — Mandates auto-retrying built-in assertions (`expect(locator).toBeVisible()`) to eliminate flakiness.
- **Semantic Locators** — Prioritizes robust user-facing locators (`getByRole`, `getByTestId`, `getByText`) over brittle CSS or XPath selectors.
- **POM & Lazy Getters** — Enforces Page Object Model inheritance with TypeScript lazy getters.
- **Strict Type Safety** — Prevents `any` types and ensures thorough typing across all generated test specs and page object extensions.

---

## 🚀 Tech Stack

- **Test Runner:** Playwright (TypeScript)
- **AI Intelligence:** Google Gemini Flash-Lite API
- **Project Management API:** Jira Cloud REST API
- **Version Control / CI/CD:** GitHub CLI (`gh`), Git automation
- **Design Pattern:** Page Object Model (POM) with `BasePage` & Lazy Getters
- **Resilience & Governance:** Self-Healing compilation loop, AI Root Cause Analysis (RCA), Automated Quarantine, and FinOps Dashboard

---

## 📁 Project Structure

```text
agentic-playwright-framework/
├── src/
│   ├── agents/
│   │   ├── generator.ts               # AI Architect Agent (Generates tests & syncs page objects)
│   │   └── reviewer.ts                # Principal SDET Code Review & Acceptance Criteria Gate
│   ├── data/
│   │   └── test-data.ts               # Centralized source of truth for test inputs & data
│   ├── fixtures/
│   │   └── agent.fixture.ts           # Custom Playwright fixture with Self-Healing Proxy
│   ├── pages/
│   │   ├── base.page.ts               # Base Page class implementing common navigation
│   │   ├── login.page.ts              # Login Page Object
│   │   ├── inventory.page.ts          # Inventory Page Object
│   │   └── checkout.page.ts           # Checkout Page Object
│   ├── scripts/
│   │   └── requirement-to-test.ts     # Autonomous CLI script (Jira → AI → Git → PR → Merge)
│   ├── utils/
│   │   ├── jira-client.ts             # Jira REST API client for comments, transitions & bug creation
│   │   └── token-logger.ts            # Real-time token consumption and FinOps cost logger
│   └── tests/
│       └── quarantine/                # Isolated directory for unstable or flaky tests
├── FINOPS-DASHBOARD.md                  # Auto-generated LLM spend & token analytics report
├── token-audit.json                     # Raw historical JSON record of token transactions
├── healing-cache.json                   # Self-healing locator repair memory
├── .env                                  # API keys and environment configurations
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js (v18 or higher recommended)
- Google Gemini API Key
- Jira Cloud Account & API Token
- GitHub CLI (`gh`) installed and authenticated (`gh auth login`)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/agentic-playwright-framework.git
cd agentic-playwright-framework
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure your credentials:

```
GEMINI_API_KEY=your_gemini_api_key_here
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_jira_api_token_here
```

---

## 🧪 Usage & Autonomous SDLC Workflow

### Running Standard Playwright Tests

Execute your test suite locally:

```bash
npx playwright test
```

### Generating New Tests via AI Agent

Use the Generator Agent to translate natural language user requirements into fully modular, POM-compliant test suites and synchronized page objects:

```bash
npx tsx src/scripts/generate-test.ts "Test SauceDemo checkout journey: login with standard_user, add backpack, proceed to checkout, and verify order success" checkout-journey.spec.ts
```

### Running the Autonomous Ticket-Driven Pipeline

The framework features a fully autonomous CLI workflow driven by Jira ticket IDs. It automatically executes a robust 6-step gated loop:

1. **Jira Integration** — Fetches requirements, summaries, and acceptance criteria.
2. **Git Feature Branch** — Creates an isolated branch for the workflow.
3. **Multi-Agent Generation & Audit** — Gemini builds the modular test spec while the Reviewer Agent performs a rigorous Principal SDET audit checking for web-first assertions, type safety, and Jira Acceptance Criteria traceability.
4. **Quality Gates & Self-Healing** — Enforces TypeScript type checking (`tsc --noEmit`), automatically feeding errors back into Gemini for up to 3 self-healing retries.
5. **Regression & RCA** — Runs the full Playwright test suite. If failures occur, AI heuristics classify root causes:
   - **True Application Bug** — Autonomously creates a structured Jira Bug Ticket for engineering.
   - **Environmental / Network Flake** — Automatically quarantines the test into `src/tests/quarantine/` and opens an infrastructure stability ticket.
6. **PR Promotion & Jira Sync** — Opens a GitHub PR, auto-merges it into `main`, updates Jira to `Done`, and logs audit reports.

Trigger the pipeline using your npm script:

```bash
npm run generate:ticket SCRUM-1
```

### Additional Framework Maintenance Agents

**Maintenance Agent** — Cleans up runtime healing caches:

```bash
npx tsx src/scripts/maintenance-agent.ts
```

**Modernization Agent** — Refactors legacy code patterns to modern Playwright standards:

```bash
npx tsx src/scripts/modernize-agent.ts
```

**Coverage Gap Audit** — Scans your Jira backlog against existing tests to spot missing test coverage:

```bash
npm run coverage:audit
```

---

## 📊 FinOps & Token Analytics

Every run automatically logs token consumption and estimates API costs into `token-audit.json`, instantly compiling an executive financial summary inside `FINOPS-DASHBOARD.md`.
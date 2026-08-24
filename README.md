# Autonomous Agentic SDLC & Playwright Framework

An enterprise-grade, autonomous software development lifecycle (SDLC) and test automation framework built with **Playwright**, **TypeScript**, and **Gemini Flash-Lite**.

This framework seamlessly bridges **Jira**, **GitHub**, and **Playwright** to execute an end-to-end autonomous loop: fetching ticket requirements, dynamically generating modular Page Object Models (POM) and test specs, validating quality gates, auto-merging Pull Requests, and syncing evidence back to Jira.

---

### Modern Playwright & TypeScript Enforcement
The framework's `GeneratorAgent` is configured to strictly enforce cutting-edge test automation standards during code generation:
* **Web-First Assertions:** Mandates auto-retrying built-in assertions (`expect(locator).toBeVisible()`) to eliminate flakiness.
* **Semantic Locators:** Prioritizes robust user-facing locators (`getByRole`, `getByTestId`, `getByText`) over brittle CSS or XPath selectors.
* **POM & Lazy Getters:** Enforces Page Object Model inheritance with TypeScript lazy getters.
* **Strict Type Safety:** Prevents `any` types and ensures thorough typing across all generated test specs and page object extensions.


## 🚀 Tech Stack

- **Test Runner:** Playwright (TypeScript)
- **AI Intelligence:** Google Gemini Flash-Lite API
- **Project Management API:** Jira Cloud REST API
- **Version Control / CI/CD:** GitHub CLI (`gh`), Git automation
- **Design Pattern:** Page Object Model (POM) with `BasePage` & Lazy Getters
- **Resilience & Optimization:** Self-Healing TypeScript compilation loop & Token & Cost Logger

---

## 📁 Project Structure

```text
agentic-playwright-framework/
├── src/
│   ├── agents/
│   │   └── generator.ts               # AI Architect Agent (Generates tests & syncs page objects)
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
│   │   ├── jira-client.ts             # Jira REST API client for comments & state transitions
│   │   └── token-logger.ts            # Real-time token consumption and cost estimation utility
│   └── tests/                         # Autonomous test specification files
├── healing-cache.json                 # Self-healing locator repair memory
├── .env                                # API keys and environment configurations
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

The framework features a fully autonomous CLI workflow driven by Jira ticket IDs. It automatically:

1. Fetches requirements from Jira and slugifies the title into a clean test file name.
2. Creates an isolated git feature branch.
3. Generates the modular test spec and POM using Gemini Flash-Lite.
4. Enforces a TypeScript Quality Gate with a built-in Self-Healing Loop (retries up to 3 times if compilation fails).
5. Runs a Full Suite Regression Check via Playwright.
6. Automatically opens a GitHub Pull Request, auto-merges it into `main`, and switches back.
7. Updates the Jira ticket status to Done and logs an exhaustive evidence report.
8. **Token Budgeting & Circuit Breakers:** Continuously monitors token consumption against a strict cost ceiling (e.g., $0.05 per run), instantly aborting runaway loops to protect infrastructure budgets.
9. **Intelligent Failure Classification (RCA):** Automatically analyzes Playwright regression failures using AI heuristics to categorize errors into *Locator Drift*, *Application Bugs*, or *Environmental Flakes*, syncing diagnostic summaries directly back to Jira.

Trigger the pipeline using your npm script:

```bash
npm run generate:ticket SCRUM-1
```

### Running the Self-Healing Maintenance Agent
Over time, runtime self-healing caches UI locator drifts into `healing-cache.json`. To prevent this cache from growing indefinitely, you can run the **Maintenance Agent** to permanently refactor your source code:

```bash
npx tsx src/scripts/maintenance-agent.ts
```

### Upgrading Legacy Code with the Modernization Agent
If you have existing legacy test specs or page objects that use outdated patterns (such as brittle CSS selectors or manual boolean checks), you can run the **Modernization Agent** to automatically sweep and refactor the codebase to modern Playwright standards:

```bash
npx tsx src/scripts/modernize-agent.ts
```
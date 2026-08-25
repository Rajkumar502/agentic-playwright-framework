import * as fs from 'fs';
import * as path from 'path';
import { ReviewerAgent } from './reviewer';
import dotenv from 'dotenv';
dotenv.config();

export class GeneratorAgent {
    async generateModularTestSystem(userRequirement: string, testFileName: string): Promise<void> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("❌ GEMINI_API_KEY missing in .env");

        console.log(`🧠 [Gemini 3.5 Flash-Lite Architect]: Generating test spec and updating page objects if needed...`);

        const testsDir = path.join(__dirname, '../tests');
        const pagesDir = path.join(__dirname, '../pages');
        const dataPath = path.join(__dirname, '../data/test-data.ts');

        // Read existing pages and test data to provide context to Gemini
        const existingTestData = fs.existsSync(dataPath) ? fs.readFileSync(dataPath, 'utf-8') : '';
        const existingLogin = fs.existsSync(path.join(pagesDir, 'login.page.ts')) ? fs.readFileSync(path.join(pagesDir, 'login.page.ts'), 'utf-8') : '';
        const existingInventory = fs.existsSync(path.join(pagesDir, 'inventory.page.ts')) ? fs.readFileSync(path.join(pagesDir, 'inventory.page.ts'), 'utf-8') : '';
        const existingCart = fs.existsSync(path.join(pagesDir, 'cart.page.ts')) ? fs.readFileSync(path.join(pagesDir, 'cart.page.ts'), 'utf-8') : '';
        const existingCheckout = fs.existsSync(path.join(pagesDir, 'checkout.page.ts')) ? fs.readFileSync(path.join(pagesDir, 'checkout.page.ts'), 'utf-8') : '';

        const prompt = `You are an elite enterprise Playwright test automation architect using TypeScript. 
Based on this requirement: "${userRequirement}", write a new Playwright test spec file named "${testFileName}".

IMPORTANT CONTEXT (Use existing page objects and test data):
- Existing Test Data: ${existingTestData}
- Existing Login Page: ${existingLogin}
- Existing Inventory Page: ${existingInventory}
- Existing Cart Page: ${existingCart}
- Existing Checkout Page: ${existingCheckout}

MODERN PLAYWRIGHT ARCHITECTURAL RULES (STRICTLY ENFORCED):
1. **Web-First Assertions**: ALWAYS use Playwright's built-in auto-retrying assertions (e.g., \`await expect(page.getByRole(...)).toBeVisible()\`). Never use manual boolean checks like \`await locator.isVisible()\`.
2. **Semantic Locators**: Prioritize user-facing semantic locators over brittle CSS or XPath selectors. Use \`page.getByRole()\`, \`page.getByTestId()\`, \`page.getByPlaceholder()\`, or \`page.getByText()\`.
3. **POM & Lazy Getters**: All page objects must extend BasePage and use TypeScript lazy getters for locators (e.g., \`private get submitButton() { return this.page.getByRole('button', { name: 'Submit' }); }\`).
4. **DRY Principle & Reusability**: Encapsulate all element interactions and assertions inside page object methods. Keep test spec files clean, concise, and focused entirely on the user journey.
5. **Strict TypeScript**: No \`any\` types. Fully type all method parameters and return values.

TECHNICAL CONVENTIONS & EXACT RELATIVE PATHS:
- Since all test spec files are saved directly inside the 'src/tests/' directory, you MUST use these exact relative import paths:
  - Import test/expect: \`import { test, expect } from '../fixtures/agent.fixture';\`
  - Import page objects: \`import { LoginPage } from '../pages/login.page';\` (or inventory/cart/checkout/etc.)
  - Import test data: \`import { TestData } from '../data/test-data';\`
- If the test requires a new method or assertion helper on a page object that doesn't exist, you MUST provide the complete updated code for that page object.

OUTPUT FORMAT:
Return your response as a valid JSON object with ONLY these keys:
{
  "testSpec": "TypeScript content for the new test file",
  "targetPageName": "Optional: filename of the page to update, e.g. cart.page.ts (leave empty string if no page update is needed)",
  "updatedPageCode": "Optional: complete updated code for the target page including any new methods, otherwise empty string"
}
Do not include markdown code block formatting like \`\`\`json or backticks. Return raw JSON text only.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`Gemini API failed with status ${response.status}`);

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJsonText = rawText.trim().replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();
        const result = JSON.parse(cleanJsonText);

        // 🛡️ MULTI-AGENT REVIEW GATE (Passing Jira Requirement for Traceability)
        console.log(`🧐 [Reviewer Agent]: Initiating Principal SDET peer review & traceability check...`);
        const reviewer = new ReviewerAgent();
        const review = await reviewer.reviewCode(result.testSpec, testFileName, userRequirement);

        console.log(`📊 [Reviewer Score]: ${review.score}/100`);
        console.log(`💬 [Reviewer Feedback]: ${review.feedback}`);

        if (!review.approved) {
            console.error(`❌ [Review Gate Failed]: Reviewer Agent rejected the generated code due to missing criteria or anti-patterns.`);
            console.error(`Required Fixes:`, review.requiredFixes);
            throw new Error(`Pipeline halted: Code failed multi-agent quality & traceability review.`);
        }
        console.log(`✨ [Reviewer Approved]: Code successfully satisfies all Jira acceptance criteria!`);

        if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });

        // 1. Write the new test file
        fs.writeFileSync(path.join(testsDir, testFileName), result.testSpec);
        console.log(`✨ [Generator Agent]: Successfully created new test file: src/tests/${testFileName}`);

        // 2. Automatically apply page updates if Gemini provided them
        if (result.targetPageName && result.updatedPageCode && result.updatedPageCode.trim().length > 10) {
            const targetPagePath = path.join(pagesDir, result.targetPageName);
            fs.writeFileSync(targetPagePath, result.updatedPageCode);
            console.log(`📁 [Generator Agent]: Automatically updated page object: src/pages/${result.targetPageName}`);
        }
    }
}
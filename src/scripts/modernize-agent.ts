import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { GeneratorAgent } from '../agents/generator';
import dotenv from 'dotenv';
dotenv.config();

async function runModernizationAgent() {
    console.log(`🧹 [Modernization Agent]: Scanning codebase for legacy Playwright patterns...`);

    const testsDir = path.resolve(process.cwd(), 'src/tests');
    const pagesDir = path.resolve(process.cwd(), 'src/pages');

    // 1. Gather all existing test specs and page objects
    const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.ts'));
    const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.page.ts'));

    let codebaseSnapshot = `=== PAGE OBJECTS ===\n`;
    for (const file of pageFiles) {
        codebaseSnapshot += `\n--- File: src/pages/${file} ---\n` + fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    }

    codebaseSnapshot += `\n\n=== TEST SPECS ===\n`;
    for (const file of testFiles) {
        codebaseSnapshot += `\n--- File: src/tests/${file} ---\n` + fs.readFileSync(path.join(testsDir, file), 'utf-8');
    }

    // 2. Create an isolated Modernization Feature Branch
    const branchName = `refactor/modernize-playwright-${Date.now()}`;
    console.log(`🌿 [Git]: Creating modernization branch: ${branchName}...`);
    try {
        execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    } catch (e) {
        execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    }

    // 3. Prompt Gemini Flash-Lite to Refactor Code to Latest Standards
    const generator = new GeneratorAgent();
    const modernizationPrompt = `
    [CODE REFACTORING & MODERNIZATION TASK]:
    You are an expert Playwright TypeScript Architect. Review the following codebase snapshot and refactor any legacy code to adhere strictly to modern Playwright and TypeScript standards:

    1. **Web-First Assertions**: Replace legacy manual assertions (e.g., checking .isVisible() manually) with auto-retrying web-first assertions (\`await expect(locator).toBeVisible()\`).
    2. **Semantic Locators**: Replace brittle CSS selectors (like \`div > div > button\`) with user-facing semantic locators (\`page.getByRole()\`, \`page.getByTestId()\`, or \`page.getByText()\`).
    3. **POM & Lazy Getters**: Ensure all page objects extend BasePage and use TypeScript lazy getters (\`private get element() { return this.page.locator(...) }\`).
    4. **Type Safety**: Remove any \`any\` types and ensure strict typing across all helper methods.

    Here is the codebase:
    ${codebaseSnapshot}

    Output the refactored files cleanly.
    `;

    console.log(`🧠 [Generator Agent]: Instructing Gemini to modernize existing codebase...`);
    await generator.generateModularTestSystem(modernizationPrompt, 'modernized-suite.spec.ts');

    // 4. Quality & Regression Gates
    console.log(`🔍 [Quality Gate]: Validating TypeScript compilation on refactored code...`);
    try {
        execSync(`npx tsc --noEmit`, { encoding: 'utf-8' });
        console.log(`✨ [Quality Gate]: Type checking passed successfully!`);
    } catch (error: any) {
        console.error(`❌ [Quality Gate Failed]: TypeScript errors found after modernization.`);
        process.exit(1);
    }

    console.log(`▶️ [Playwright Runner]: Running full regression test suite against refactored code...`);
    try {
        execSync(`npx playwright test`, { encoding: 'utf-8' });
        console.log(`✨ [Playwright Runner]: Full regression suite passed with zero errors!`);
    } catch (error: any) {
        console.error(`❌ [Playwright Runner]: Regression detected after modernization refactor.`);
        process.exit(1);
    }

    // 5. Commit and Push to Branch
    console.log(`📦 [Git]: Committing modernized files...`);
    try {
        execSync(`git add src/tests/ src/pages/`, { stdio: 'ignore' });
        execSync(`git commit -m "refactor(agent): modernize codebase to latest Playwright standards"`, { stdio: 'ignore' });
        execSync(`git push -u origin ${branchName}`, { stdio: 'ignore' });
    } catch (e) {
        console.warn(`⚠️ Git commit/push warning.`);
    }

    // 6. 🛑 HUMAN REVIEW GATE (Stops safely without auto-merging)
    console.log(`🔀 [GitHub]: Opening Pull Request for HUMAN modernization review...`);
    try {
        const prOutput = execSync(
            `gh pr create --title "🧹 [Modernization Agent] Refactor to Latest Playwright Standards" --body "This automated modernization PR upgrades legacy test specs and page objects to use web-first assertions, semantic locators, and strict typing. **Requires human review before merging.** Full regression suite passed locally." --base main`,
            { encoding: 'utf-8' }
        );
        console.log(`✅ [Complete]: Modernization PR created successfully: ${prOutput.trim()}`);
    } catch (e) {
        console.warn(`⚠️ [GitHub CLI]: Could not auto-create PR. Ensure 'gh auth login' is active.`);
    }

    console.log(`🔒 [Governance]: Pipeline halted safely. Awaiting your manual review of the refactored code!`);
}

runModernizationAgent();
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { GeneratorAgent } from '../agents/generator';
import dotenv from 'dotenv';
dotenv.config();

async function runMaintenanceAgent() {
    const cachePath = path.resolve(process.cwd(), 'healing-cache.json');
    
    // 1. Check if healing-cache.json exists and has entries
    if (!fs.existsSync(cachePath)) {
        console.log(`✨ [Maintenance Agent]: No healing cache found. All locators are pristine!`);
        return;
    }

    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    const healedLocators = Object.keys(cacheData);

    if (healedLocators.length === 0) {
        console.log(`✨ [Maintenance Agent]: Healing cache is empty. No maintenance required.`);
        return;
    }

    console.log(`🛠️ [Maintenance Agent]: Found ${healedLocators.length} healed locators requiring permanent code refactoring.`);

    // 2. Create a Maintenance Feature Branch
    const branchName = `maintenance/auto-patch-locators-${Date.now()}`;
    console.log(`🌿 [Git]: Creating maintenance branch: ${branchName}...`);
    try {
        execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    } catch (e) {
        execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    }

    // 3. Delegate Refactoring to the GeneratorAgent
    console.log(`🧠 [Generator Agent]: Instructing agent to patch page objects based on healing cache...`);
    const generator = new GeneratorAgent();
    
    // Construct a maintenance prompt leveraging the existing framework intelligence
    const maintenanceRequirement = `
    [MAINTENANCE TASK - LOCATOR REFACTORING]:
    The runtime self-healing cache recorded the following drifted locators and their successful fixes:
    ${JSON.stringify(cacheData, null, 2)}

    Please inspect the page object files in src/pages/ and permanently update any matching outdated selectors to use the stable healed selectors provided above. Preserve clean TypeScript lazy getters.
    `;

    // Trigger generation/patching cycle
    await generator.generateModularTestSystem(maintenanceRequirement, 'maintenance-patch.spec.ts');

    // 4. Quality & Regression Gate
    console.log(`🔍 [Quality Gate]: Running TypeScript type-check on patched files...`);
    try {
        execSync(`npx tsc --noEmit`, { encoding: 'utf-8' });
        console.log(`✨ [Quality Gate]: Type-checking passed successfully!`);
    } catch (error: any) {
        console.error(`❌ [Quality Gate Failed]: TypeScript errors found in patched files.`);
        process.exit(1);
    }

    console.log(`▶️ [Playwright Runner]: Running full regression test suite...`);
    try {
        execSync(`npx playwright test`, { encoding: 'utf-8' });
        console.log(`✨ [Playwright Runner]: Full regression suite passed with zero errors!`);
    } catch (error: any) {
        console.error(`❌ [Playwright Runner]: Regression suite failed after patching.`);
        process.exit(1);
    }

    // 5. Commit and Push to Maintenance Branch
    console.log(`📦 [Git]: Committing permanent locator fixes...`);
    try {
        execSync(`git add src/pages/`, { stdio: 'ignore' });
        execSync(`git commit -m "fix(maintenance): autonomous refactoring of healed UI locators"`, { stdio: 'ignore' });
        execSync(`git push -u origin ${branchName}`, { stdio: 'ignore' });
    } catch (e) {
        console.warn(`⚠️ Git commit/push warning or already handled.`);
    }

    // 6. 🛑 HUMAN REVIEW GATE (Intentionally stops here without merging!)
    console.log(`🔀 [GitHub]: Opening Pull Request for HUMAN review...`);
    try {
        const prOutput = execSync(
            `gh pr create --title "🛠️ [Maintenance Agent] Permanent Locator Refactoring" --body "This automated maintenance PR permanently updates Page Object locators based on runtime healing telemetry. **Requires human review and sign-off before merging.** Full regression suite passed locally." --base main`,
            { encoding: 'utf-8' }
        );
        console.log(`✅ [Complete]: Maintenance PR created successfully: ${prOutput.trim()}`);
    } catch (e) {
        console.warn(`⚠️ [GitHub CLI]: Could not auto-create PR. Ensure 'gh auth login' is active.`);
    }

    console.log(`🔒 [Governance]: Pipeline halted safely. No auto-merge performed. Awaiting your manual code review!`);
}

runMaintenanceAgent();
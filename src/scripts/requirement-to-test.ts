import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { GeneratorAgent } from '../agents/generator';
import { JiraClient } from '../utils/jira-client';
import { TokenLogger } from '../utils/token-logger';
import dotenv from 'dotenv';
dotenv.config();

async function runRequirementParser() {
    const args = process.argv.slice(2);
    const inputArg = args[0];
    let userRequirement = '';
    let testFileName = '';
    let issueKey = '';

    if (!inputArg) {
        console.error(`❌ Error: Please provide a Jira ticket ID (e.g., SCRUM-1).`);
        console.log(`💡 Usage examples:`);
        console.log(`   npm run generate:ticket SCRUM-1`);
        process.exit(1);
    }

    if (/^[A-Z]+-\d+$/.test(inputArg)) {
        issueKey = inputArg;
        console.log(`🔗 [Jira API]: Fetching ticket details for ${issueKey} from Jira...`);
        const ticketData = await fetchJiraTicketDetails(issueKey);
        userRequirement = ticketData.requirementText;
        testFileName = `${slugify(ticketData.summary)}.spec.ts`;
    } else {
        console.error(`❌ Error: Please provide a valid Jira ticket key (e.g., SCRUM-1).`);
        process.exit(1);
    }

    // 1. Create a clean Git Feature Branch for Review
    const branchName = `feature/${issueKey.toLowerCase()}-${slugify(testFileName.replace('.spec.ts', ''))}`;
    console.log(`🌿 [Git]: Creating isolated feature branch: ${branchName}...`);
    try {
        execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    } catch (e) {
        console.log(`⚠️ Branch may already exist, switching to it...`);
        execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    }

    // 2. 🤖 SELF-HEALING GENERATION LOOP & CIRCUIT BREAKER PROTECTION
    const generator = new GeneratorAgent();
    let qualityPassed = false;
    let qualityErrorOutput = '';
    let maxRetries = 3;
    let attempt = 0;
    let finalRequirementContext = userRequirement;
    let circuitBroken = false;
    let circuitBreakReason = '';

    while (attempt < maxRetries && !qualityPassed && !circuitBroken) {
        attempt++;
        console.log(`🧠 [Generator Agent]: Building test system (Attempt ${attempt}/${maxRetries}) with file name: ${testFileName}...`);
        
        if (attempt > 1) {
            finalRequirementContext = `${userRequirement}\n\n[SELF-HEALING FIX REQUIRED]: Your previous code generation failed TypeScript compilation with this error:\n${qualityErrorOutput}\nPlease fix the incorrect import paths, types, or syntax issues in this attempt.`;
        }

        try {
            await generator.generateModularTestSystem(finalRequirementContext, testFileName);

            // 📊 Evaluate Token Budget & Circuit Breaker
            TokenLogger.logUsage(finalRequirementContext, testFileName, "gemini-flash-lite");
        } catch (error: any) {
            if (error.message && error.message.includes('Circuit Breaker Triggered')) {
                circuitBroken = true;
                circuitBreakReason = error.message;
                console.error(`❌ ${circuitBreakReason}`);
                break;
            }
            throw error;
        }

        // 3. 🛡️ CODE QUALITY GATE: Strict TypeScript Check
        console.log(`🔍 [Quality Gate]: Validating TypeScript compilation and type standards...`);
        try {
            execSync(`npx tsc --noEmit`, { encoding: 'utf-8' });
            console.log(`✨ [Quality Gate]: Type checking passed successfully!`);
            qualityPassed = true;
        } catch (error: any) {
            qualityErrorOutput = error.stdout || error.message;
            console.warn(`⚠️ [Quality Gate Failed]: Attempt ${attempt} had TypeScript compilation errors.`);
        }
    }

    // 4. REGRESSION CHECK: Run the ENTIRE test suite (Only if quality check passed and circuit didn't break)
    let fullSuitePassed = false;
    let executionOutput = '';
    let rcaClassification = 'N/A';

    if (qualityPassed && !circuitBroken) {
        console.log(`▶️ [Playwright Runner]: Running FULL test suite regression check...`);
        try {
            executionOutput = execSync(`npx playwright test`, { encoding: 'utf-8' });
            console.log(`✨ [Playwright Runner]: Full test suite passed with zero regressions!`);
            fullSuitePassed = true;
        } catch (error: any) {
            executionOutput = error.stdout || error.message;
            console.error(`❌ [Playwright Runner]: Regression detected! Analyzing root cause...`);
            fullSuitePassed = false;

            // 🧠 INTELLIGENT FAILURE CLASSIFICATION (RCA)
            rcaClassification = await performAiRootCauseAnalysis(executionOutput);
        }
    }

    // 5. Commit, Push, Open PR, and Auto-Merge to Main (Only if all gates pass)
    let prUrl = '';
    let mergedSuccessfully = false;
    const pipelineSuccess = qualityPassed && fullSuitePassed && !circuitBroken;

    if (pipelineSuccess) {
        console.log(`📦 [Git]: Committing changes...`);
        try {
            execSync(`git add src/tests/${testFileName} src/pages/`, { stdio: 'ignore' });
            execSync(`git commit -m "feat(${issueKey}): autonomous generation and self-healing of ${testFileName}"`, { stdio: 'ignore' });
            execSync(`git push -u origin ${branchName}`, { stdio: 'ignore' });

            console.log(`🔀 [GitHub]: Opening Pull Request for code review...`);
            const prOutput = execSync(
                `gh pr create --title "🤖 [Agent] ${issueKey}: Automated test for ${testFileName}" --body "Autonomous AI framework self-healed and generated this test for Jira ticket ${issueKey}. Passed strict TypeScript check, regression suite, and token budget limits." --base main`,
                { encoding: 'utf-8' }
            );
            prUrl = prOutput.trim();

            console.log(`🔀 [GitHub]: Auto-merging PR into main...`);
            execSync(`gh pr merge --merge --delete-branch`, { stdio: 'inherit' });
            execSync(`git checkout main`, { stdio: 'ignore' });
            execSync(`git pull origin main`, { stdio: 'ignore' });

            mergedSuccessfully = true;
            console.log(`✨ [GitHub]: Successfully merged into main!`);
        } catch (e) {
            console.warn(`⚠️ [GitHub CLI]: PR creation or auto-merge skipped.`);
        }
    }

    // 6. Bi-directional Sync & Final Jira Status Transition to "Done" with Evidence
    console.log(`🔄 [Jira Sync]: Updating ticket ${issueKey}...`);
    if (pipelineSuccess && mergedSuccessfully) {
        const evidenceComment = [
            `🟢 Autonomous SDLC Pipeline SUCCESS & MERGED!`,
            `- **Test File Created:** \`src/tests/${testFileName}\``,
            `- **Self-Healing Attempts:** ${attempt}`,
            `- **Token Budget Check:** Passed (Within ceiling)`,
            `- **Regression Suite:** Passed (0 failures)`,
            `- **Pull Request:** [View PR on GitHub](${prUrl || 'Check Repository'})`,
            `- **Status:** Auto-merged into \`main\` and ticket completed.`
        ].join('\n');

        await JiraClient.addComment(issueKey, evidenceComment);

        if (typeof (JiraClient as any).transitionTicket === 'function') {
            await (JiraClient as any).transitionTicket(issueKey, 'Done');
        }
    } else {
        let failureReason = '';
        if (circuitBroken) {
            failureReason = circuitBreakReason;
        } else if (!qualityPassed) {
            failureReason = `TypeScript Type-Checking Failed after ${maxRetries} tries:\n${qualityErrorOutput.slice(0, 400)}`;
        } else {
            failureReason = `Regression Suite Failed.\n- **AI Root Cause Analysis (RCA):** ${rcaClassification}\n- **Details:**\n${executionOutput.slice(0, 400)}`;

            // 🐛 AUTOMATED DEFECT TICKET GENERATION FOR APP BUGS
            if (rcaClassification.includes('True Application Bug')) {
                try {
                    const projectKey = issueKey.split('-')[0]; // e.g., 'SCRUM'
                    const bugSummary = `Regression failure detected during automation of ${issueKey}`;
                    const bugDescription = `The autonomous SDLC pipeline detected a functional defect during regression testing.\n\nFailing Test: ${testFileName}\nRequirement: ${userRequirement}\n\nRCA Findings:\n${executionOutput.slice(0, 1000)}`;
                    
                    if (typeof (JiraClient as any).createBugTicket === 'function') {
                        const newBugKey = await (JiraClient as any).createBugTicket(projectKey, bugSummary, bugDescription);
                        failureReason += `\n- **Automated Action:** Created Jira Bug Ticket **[${newBugKey}]** for engineering investigation.`;
                    }
                } catch (bugErr: any) {
                    console.warn(`⚠️ [Jira Sync]: Could not auto-create bug ticket: ${bugErr.message}`);
                }
            }
            // ☣️ AUTOMATED QUARANTINE FOR FLAKY TESTS
            else if (rcaClassification.includes('Environmental / Network Flake')) {
                try {
                    console.warn(`☣️ [Quarantine Agent]: Flake detected. Isolating flaky test...`);
                    const quarantineDir = path.join(__dirname, '../tests/quarantine');
                    if (!fs.existsSync(quarantineDir)) fs.mkdirSync(quarantineDir, { recursive: true });

                    const sourcePath = path.join(__dirname, '../tests', testFileName);
                    const destPath = path.join(quarantineDir, testFileName);

                    if (fs.existsSync(sourcePath)) {
                        fs.renameSync(sourcePath, destPath);
                        console.log(`☣️ [Quarantine Agent]: Moved ${testFileName} to src/tests/quarantine/`);
                        
                        const projectKey = issueKey.split('-')[0];
                        const bugSummary = `[Flaky Test] Environmental instability in ${testFileName}`;
                        const bugDescription = `The autonomous pipeline detected environmental flakiness and quarantined the test.\n\nTest File: ${testFileName}\nLogs:\n${executionOutput.slice(0, 500)}`;
                        
                        if (typeof (JiraClient as any).createBugTicket === 'function') {
                            const newBugKey = await (JiraClient as any).createBugTicket(projectKey, bugSummary, bugDescription);
                            failureReason += `\n- **Automated Action:** Test quarantined to \`src/tests/quarantine/\` and Jira Bug Ticket **[${newBugKey}]** created for stability review.`;
                        }
                    }
                } catch (quarantineErr: any) {
                    console.warn(`⚠️ [Quarantine Action Failed]: ${quarantineErr.message}`);
                }
            }
        }

        await JiraClient.addComment(
            issueKey,
            `🔴 Autonomous Pipeline Blocked.\n- **Reason:** ${failureReason}`
        );

        if (typeof (JiraClient as any).transitionTicket === 'function') {
            await (JiraClient as any).transitionTicket(issueKey, 'To Do');
        }
    }

    console.log(`🚀 [Complete]: Full Autonomous SDLC Loop executed with Token Budgeting, RCA, Self-Healing, and Jira Sync!`);
}

/**
 * Intelligent Failure Classification via AI Heuristics
 */
async function performAiRootCauseAnalysis(errorLog: string): Promise<string> {
    console.log(`🤖 [RCA Agent]: Classifying test failure root cause...`);
    if (errorLog.includes('TimeoutError') || errorLog.includes('waiting for locator')) {
        return 'Brittle Locator Drift (UI selector changed or element missing from DOM)';
    } else if (errorLog.includes('expect(') && errorLog.includes('Received:')) {
        return 'True Application Bug / Assertion Mismatch (Observed UI state did not match expected business criteria)';
    } else {
        return 'Environmental / Network Flake or Browser Crash';
    }
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function fetchJiraTicketDetails(issueKey: string): Promise<{ summary: string; requirementText: string }> {
    const jiraUrl = process.env.JIRA_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraToken = process.env.JIRA_API_TOKEN;

    if (!jiraUrl || !jiraEmail || !jiraToken) {
        throw new Error(`❌ Jira credentials missing in .env!`);
    }

    const credentials = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
    const response = await fetch(`${jiraUrl}/rest/api/3/issue/${issueKey}`, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${credentials}`, 'Accept': 'application/json' }
    });

    if (response.status === 404) {
        console.error(`\n❌ [Jira API Error]: Ticket "${issueKey}" was not found in your Jira workspace (404).`);
        console.error(`👉 Please verify the ticket key or create it in Jira before triggering the pipeline.\n`);
        process.exit(1);
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch Jira ticket ${issueKey}. Status: ${response.status}`);
    }

    const data = await response.json() as any;
    const summary = data.fields.summary || 'feature test';
    
    let description = 'No description provided.';
    if (typeof data.fields.description === 'string') {
        description = data.fields.description;
    } else if (data.fields.description?.content) {
        try {
            description = data.fields.description.content
                .map((block: any) => block.content?.map((c: any) => c.text).join('') || '')
                .join('\n');
        } catch (e) {
            description = JSON.stringify(data.fields.description);
        }
    }

    console.log(`✅ [Jira API]: Successfully fetched ticket "${summary}"`);
    return {
        summary,
        requirementText: `Jira Ticket ${issueKey}: ${summary}\nDescription: ${description}`
    };
}

runRequirementParser();
import * as fs from 'fs';
import * as path from 'path';

interface TokenRecord {
    timestamp: string;
    testFileName: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
}

export class TokenLogger {
    // 🛡️ Strict budget circuit breaker threshold per run ($0.05 USD)
    public static MAX_COST_LIMIT = 0.05;

    private static logFilePath = path.join(process.cwd(), 'token-audit.json');
    private static dashboardPath = path.join(process.cwd(), 'FINOPS-DASHBOARD.md');

    static logUsage(promptText: string, responseTextOrTestName: string, modelName: string = "gemini-flash-lite"): number {
        // Handle parameters flexibly whether passed as (prompt, testName) or (prompt, responseText)
        const isTestFileName = responseTextOrTestName.endsWith('.spec.ts');
        const promptTokens = Math.ceil(promptText.length / 4);
        const completionTokens = isTestFileName ? 150 : Math.ceil(responseTextOrTestName.length / 4);
        const totalTokens = promptTokens + completionTokens;

        const inputCostPer1M = 0.075;
        const outputCostPer1M = 0.30;
        const estimatedCost = ((promptTokens / 1_000_000) * inputCostPer1M) + ((completionTokens / 1_000_000) * outputCostPer1M);

        console.log(`\n📊 [Token & Cost Metrics]:`);
        console.log(`   - Model: ${modelName}`);
        console.log(`   - Estimated Prompt Tokens: ~${promptTokens.toLocaleString()}`);
        console.log(`   - Estimated Completion Tokens: ~${completionTokens.toLocaleString()}`);
        console.log(`   - Total Tokens Used: ~${totalTokens.toLocaleString()}`);
        console.log(`   - Estimated Execution Cost: $${estimatedCost.toFixed(6)}`);

        // 🛡️ CIRCUIT BREAKER CHECK
        if (estimatedCost > this.MAX_COST_LIMIT) {
            throw new Error(`🚨 [Circuit Breaker Triggered]: Estimated run cost ($${estimatedCost.toFixed(4)}) exceeded maximum budget limit of $${this.MAX_COST_LIMIT}! Aborting pipeline to prevent cost runaways.`);
        }

        const testFileName = isTestFileName ? responseTextOrTestName : 'automated-generation.spec.ts';

        // Persist Record & Dashboard
        const record: TokenRecord = {
            timestamp: new Date().toISOString(),
            testFileName,
            model: modelName,
            promptTokens,
            completionTokens,
            totalTokens,
            estimatedCost: parseFloat(estimatedCost.toFixed(6))
        };

        let records: TokenRecord[] = [];
        if (fs.existsSync(this.logFilePath)) {
            try {
                records = JSON.parse(fs.readFileSync(this.logFilePath, 'utf-8'));
            } catch (e) {
                records = [];
            }
        }

        records.push(record);
        fs.writeFileSync(this.logFilePath, JSON.stringify(records, null, 2));
        this.generateDashboard(records);

        console.log(`💾 [FinOps Logger]: Persisted usage record to root token-audit.json & FINOPS-DASHBOARD.md`);

        return estimatedCost;
    }

    private static generateDashboard(records: TokenRecord[]) {
        const totalRuns = records.length;
        const cumulativeTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
        const cumulativeCost = records.reduce((sum, r) => sum + r.estimatedCost, 0).toFixed(5);

        const rows = records.map(r => 
            `| ${r.timestamp.split('T')[0]} | \`${r.testFileName}\` | ${r.model} | ${r.totalTokens} | $${r.estimatedCost} |`
        ).join('\n');

        const dashboardContent = `# 📊 Autonomous SDLC FinOps & Token Analytics Dashboard

> **Live Financial & LLM Usage Tracking** for your AI-Driven Playwright Framework.

---

## 📈 Executive Summary
- **Total Test Generation Runs:** \`${totalRuns}\`
- **Cumulative Tokens Consumed:** \`${cumulativeTokens.toLocaleString()}\`
- **Total Estimated LLM Spend:** \`$${cumulativeCost}\`
- **Active Model:** \`Gemini 3.5 Flash-Lite\`

---

## 📝 Execution Audit Log
| Date | Test Spec | Model | Tokens | Cost (USD) |
| :--- | :--- | :--- | :--- | :--- |
${rows}

---
*Dashboard auto-updated by Autonomous SDLC Framework on ${new Date().toLocaleString()}.*
`;

        fs.writeFileSync(this.dashboardPath, dashboardContent);
    }
}
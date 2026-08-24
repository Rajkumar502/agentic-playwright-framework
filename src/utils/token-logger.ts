export class TokenLogger {
    // Strict budget circuit breaker threshold per run ($0.05 USD)
    public static MAX_COST_LIMIT = 0.05;

    static logUsage(promptText: string, responseText: string, modelName: string = "gemini-flash-lite"): number {
        const promptTokens = Math.ceil(promptText.length / 4);
        const completionTokens = Math.ceil(responseText.length / 4);
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

        return estimatedCost;
    }
}
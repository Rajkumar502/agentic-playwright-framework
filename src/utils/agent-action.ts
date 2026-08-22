import { Page } from '@playwright/test';
import { HealerAgent } from '../agents/healer';

/**
 * Universal Agentic Action Wrapper. 
 * Automatically handles failure, DOM capture, Gemini AI healing, and retrying for ANY action.
 */
async function agentAction(page: Page, originalSelector: string, actionFn: (selector: string) => Promise<void>): Promise<void> {
    // 1. Check local cache first (0 tokens spent)
    let activeSelector = HealerAgent.getCachedSelector(originalSelector) || originalSelector;

    try {
        // Try running the action with a quick timeout
        await actionFn(activeSelector);
    } catch (error) {
        console.log(`🤖 [Agentic Framework]: Action failed on selector "${activeSelector}". Triggering Gemini 3.5 Flash-Lite...`);
        
        // 2. Capture a compact DOM snippet (token efficient)
        const domSnippet = await page.locator('form').innerHTML();
        
        // 3. Ask Gemini AI to fix the broken selector
        const healer = new HealerAgent();
        const healedSelector = await healer.healLocatorWithLLM(originalSelector, domSnippet);
        
        // 4. Retry the exact same action using the newly healed selector
        console.log(`🔄 [Agentic Framework]: Retrying action with healed selector: "${healedSelector}"`);
        await actionFn(healedSelector);
    }
}
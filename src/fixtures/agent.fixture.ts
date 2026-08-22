import { test as base, Page, Locator } from '@playwright/test';
import { HealerAgent } from '../agents/healer';

export const test = base.extend<{ page: Page }>({
    page: async ({ page }, use) => {
        const originalLocator = page.locator.bind(page);

        page.locator = (selector: string, options?: any): Locator => {
            const loc = originalLocator(selector, options);

            // Helper to handle smart healing with slowness protection
            const executeWithHealing = async (actionName: string, actionFn: (targetLoc: Locator) => Promise<void>) => {
                let activeSelector = HealerAgent.getCachedSelector(selector) || selector;
                let activeLoc = originalLocator(activeSelector, options);

                try {
                    // Give normal Playwright auto-waiting a reasonable window (e.g., 5 seconds) 
                    // to handle standard network slowness or animations.
                    await actionFn(activeLoc);
                } catch (error) {
                    // BEFORE calling Gemini, check if the element actually exists in the DOM.
                    // If count() > 0, it means the element IS there, but maybe unclickable/disabled (slowness/overlay).
                    // Do NOT call AI yet; let Playwright handle it or throw a real timeout.
                    const elementCount = await activeLoc.count();
                    
                    if (elementCount > 0) {
                        console.log(`⏳ [Agentic Framework]: Element found for "${activeSelector}" but action timed out (likely UI slowness/animation). Retrying natively...`);
                        // Retry once more with full timeout, bypassing AI
                        await actionFn(activeLoc);
                        return;
                    }

                    // If count() === 0, the locator is genuinely missing or broken (changed ID/class).
                    console.log(`\n🤖 [Agentic AI]: Locator "${activeSelector}" returned 0 elements (Structural change detected).`);
                    console.log(`🧠 [Gemini 3.5 Flash-Lite]: Waking up to heal selector...`);
                    
                    const domSnippet = await originalLocator('form').innerHTML().catch(() => "<div>Form not found</div>");
                    const healer = new HealerAgent();
                    const healedSelector = await healer.healLocatorWithLLM(selector, domSnippet);

                    console.log(`🔄 [Agentic AI]: Retrying ${actionName} with healed selector: "${healedSelector}"`);
                    const healedLoc = originalLocator(healedSelector, options);
                    await actionFn(healedLoc);
                }
            };

            loc.click = async (clickOptions?: any) => {
                await executeWithHealing('click', async (targetLoc) => {
                    await targetLoc.click({ ...clickOptions, timeout: 5000 });
                });
            };

            loc.fill = async (value: string, fillOptions?: any) => {
                await executeWithHealing('fill', async (targetLoc) => {
                    await targetLoc.fill(value, { ...fillOptions, timeout: 5000 });
                });
            };

            return loc;
        };

        await use(page);
    }
});

export { expect } from '@playwright/test';
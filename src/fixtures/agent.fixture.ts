import { test as base, expect, Page } from '@playwright/test';
import { HealerAgent } from '../agents/healer'; // Point to your HealerAgent file path

export const test = base.extend<{ page: Page }>({
    page: async ({ page }, use) => {
        const originalLocator = page.locator.bind(page);
        const healer = new HealerAgent();

        // Override page.locator with our self-healing proxy wrapper
        page.locator = (selector: string, options?: any) => {
            // Check cache first using your HealerAgent method
            const cachedSelector = HealerAgent.getCachedSelector(selector);
            let currentSelector = cachedSelector || selector;
            
            const loc = originalLocator(currentSelector, options);

            // Methods to intercept (both actions and assertion checks)
            const methodsToIntercept = [
                'click', 'fill', 'type', 'press', 'selectOption', 
                'check', 'uncheck', 'hover', 'focus', 
                'isVisible', 'textContent', 'getAttribute'
            ];

            const proxyHandler = {
                get(target: any, prop: string | symbol, receiver: any) {
                    const originalMethod = Reflect.get(target, prop, receiver);

                    if (typeof originalMethod === 'function' && methodsToIntercept.includes(prop as string)) {
                        return async (...args: any[]) => {
                            try {
                                return await originalMethod.apply(target, args);
                            } catch (error) {
                                console.log(`⚠️ Locator operation failed with "${currentSelector}". Invoking HealerAgent...`);
                                
                                // Capture DOM snippet for Gemini context
                                const domSnippet = await page.content();
                                
                                // Call your HealerAgent to analyze and heal via Gemini 3.5 Flash-Lite
                                const healedSelector = await healer.healLocatorWithLLM(currentSelector, domSnippet);

                                if (healedSelector && healedSelector !== currentSelector) {
                                    // Retry operation with the newly healed selector
                                    currentSelector = healedSelector;
                                    const healedLoc = originalLocator(healedSelector, options);
                                    const healedMethod = Reflect.get(healedLoc, prop, receiver);
                                    return await healedMethod.apply(healedLoc, args);
                                }
                                throw error;
                            }
                        };
                    }

                    if (typeof originalMethod === 'function') {
                        return originalMethod.bind(target);
                    }
                    return originalMethod;
                }
            };

            return new Proxy(loc, proxyHandler);
        };

        await use(page);
    }
});

export { expect };
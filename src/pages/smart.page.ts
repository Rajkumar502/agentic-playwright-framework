import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HealerAgent } from '../agents/healer';

export class SmartPage extends BasePage {
    private get formLocator() {
        return this.page.locator('form');
    }

    private getDynamicLocator(selector: string) {
        return this.page.locator(selector);
    }

    constructor(page: Page) {
        super(page);
    }

    async smartClick(selector: string): Promise<void> {
        let activeSelector = HealerAgent.getCachedSelector(selector) || selector;

        try {
            await this.getDynamicLocator(activeSelector).click({ timeout: 2000 });
        } catch (error) {
            console.log(`⚠️ Action failed on "${activeSelector}". Triggering Agentic AI Healer...`);
            
            const domSnippet = await this.formLocator.innerHTML();
            
            const healer = new HealerAgent();
            const newSelector = await healer.healLocatorWithLLM(selector, domSnippet);
            
            console.log(`🔄 Retrying action with AI-healed selector: "${newSelector}"`);
            await this.getDynamicLocator(newSelector).click();
        }
    }

    async verifyElementVisible(selector: string): Promise<void> {
        await expect(this.getDynamicLocator(selector)).toBeVisible();
    }

    async verifyElementText(selector: string, expectedText: string): Promise<void> {
        await expect(this.getDynamicLocator(selector)).toHaveText(expectedText);
    }
}
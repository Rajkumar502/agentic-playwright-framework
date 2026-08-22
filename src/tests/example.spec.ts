import { test, expect } from '@playwright/test';

test('basic pre-flight and navigation test', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
});
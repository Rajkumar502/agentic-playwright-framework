import { test, expect } from '../fixtures/agent.fixture';
import { ApiValidator } from '../utils/api-validator';
import { LoginPage } from '../pages/login.page';
import { TestData } from '../data/test-data';

test.describe('Agentic Shift-Left: API Contract & UI Flow', () => {
    
    test('should validate API contract before executing UI journey', async ({ page, request }) => {
        // 1. Shift-Left API Contract Validation
        const apiValidator = new ApiValidator(request);
        await apiValidator.validateSauceDemoInventoryContract('https://www.saucedemo.com');

        // 2. Proceed to UI Test Journey if API contract passes
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(TestData.users.standard, TestData.passwords.standard);

        // Verify successful login transition to inventory
        await expect(page).toHaveURL(/.*inventory.html/);
        console.log(`✨ [SDLC Flow]: API contract check and UI journey completed successfully!`);
    });
});
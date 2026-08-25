import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { TestData } from '../data/test-data';

test.describe('SCRUM-3: Verify user can successfully log out of the application via sidebar menu', () => {
  test('should successfully log out and redirect to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step 1: Navigate to login and log in as a standard user
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // Verify we are on the inventory page
    await expect(page).toHaveURL(new RegExp(TestData.urls.inventory));

    // Step 2: Open the sidebar navigation via the burger menu icon
    await inventoryPage.openSidebarMenu();

    // Step 3: Click the "Logout" option
    await inventoryPage.clickLogout();

    // Step 4: Verify application terminates session, redirects to login page, and hides protected inventory views
    await loginPage.verifyLoginPageIsVisible();

    // Attempting to access inventory page directly via URL should fail or redirect back to login
    await page.goto(TestData.urls.inventory);
    await loginPage.verifyLoginPageIsVisible();
  });
});

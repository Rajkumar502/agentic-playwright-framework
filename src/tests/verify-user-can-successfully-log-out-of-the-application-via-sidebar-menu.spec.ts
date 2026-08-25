import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { TestData } from '../data/test-data';

test.describe('SCRUM-3: Sidebar Menu Logout Functionality', () => {
  test('Verify user can successfully log out of the application via sidebar menu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step 1: Navigate to the login page and log in with standard user credentials
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // Step 2: Verify user is successfully logged in and on the inventory page
    await expect(page).toHaveURL(TestData.urls.inventory);

    // Step 3: Open the sidebar navigation via the burger menu icon
    await inventoryPage.openSidebarMenu();

    // Step 4: Click the Logout option
    await inventoryPage.clickLogout();

    // Step 5: Verify session is terminated, redirected to login page, and protected views are hidden
    await loginPage.verifyLoginPageIsVisible();
    
    // Attempting to navigate back to inventory via URL should be blocked/redirected back to login
    await page.goto(TestData.urls.inventory);
    await loginPage.verifyLoginPageIsVisible();
  });
});
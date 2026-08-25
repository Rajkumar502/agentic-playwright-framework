import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { TestData } from '../data/test-data';

test.describe('SCRUM-3: Sidebar Menu Logout Verification', () => {
  test('Verify user can successfully log out of the application via sidebar menu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step 1: Navigate to application and log in with valid standard user credentials
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // Verify successful login by checking arrival at the inventory page
    await expect(page).toHaveURL(new RegExp(TestData.urls.inventory));

    // Step 2: Open the sidebar navigation by clicking the burger menu icon
    await inventoryPage.openSidebarMenu();

    // Step 3: Click the "Logout" option
    await inventoryPage.clickLogout();

    // Step 4: Verify session termination, redirection to login page, and protection of inventory views
    await loginPage.verifyLoginPageIsVisible();
    await expect(page).toHaveURL('/');

    // Attempting to navigate back to the protected inventory page should fail or redirect back to login
    await page.goto(TestData.urls.inventory);
    await loginPage.verifyLoginPageIsVisible();
  });
});
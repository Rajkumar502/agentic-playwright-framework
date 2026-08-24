import { test, expect } from '../fixtures/agent.fixture';
import { TestData } from '../data/test-data';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

test.describe('JIRA-104 - Product Sorting Journey', () => {
  test('should sort products by price from low to high and display the cheapest item first', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // 1. Login with standard_user credentials from TestData
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // 2. Navigate to the inventory page (and verify URL)
    await expect(page).toHaveURL(TestData.urls.inventory);

    // 3. Select "Price (low to high)" from the product sort dropdown
    await inventoryPage.sortByPriceLowToHigh();

    // 4. Verify that the first item in the inventory list is "Sauce Labs Onesie"
    await inventoryPage.verifyFirstItemName('Sauce Labs Onesie');
  });
});
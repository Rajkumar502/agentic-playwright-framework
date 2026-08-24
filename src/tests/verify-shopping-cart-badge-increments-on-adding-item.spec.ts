import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { TestData } from '../data/test-data';

test.describe('SCRUM-1: Shopping Cart Badge', () => {
  test('Verify shopping cart badge increments on adding item', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step 1: Navigate and login as standard user
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // Verify we are on the inventory page
    await expect(page).toHaveURL(TestData.urls.inventory);

    // Step 2: Add product to cart
    await inventoryPage.addItemToCart(TestData.products.bikeLight);

    // Step 3: Verify cart badge updates to show count of 1
    await inventoryPage.verifyCartBadgeCount('1');
  });
});

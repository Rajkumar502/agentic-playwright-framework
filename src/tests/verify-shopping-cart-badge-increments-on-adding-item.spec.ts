import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { TestData } from '../data/test-data';

test.describe('SCRUM-1: Shopping Cart Badge', () => {
  test('Verify shopping cart badge increments on adding item', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step 1: Login as standard user
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // Verify successful navigation to inventory page
    await expect(page).toHaveURL(TestData.urls.inventory);

    // Step 2: Add product to cart and verify badge increments
    await inventoryPage.addItemToCart(TestData.products.bikeLight);
    await inventoryPage.verifyCartBadgeCount('1');
  });
});

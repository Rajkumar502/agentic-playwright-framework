import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';
import { TestData } from '../data/test-data';

test('Remove Sauce Labs Bike Light from cart and verify cart badge is empty', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  // 1. Navigate and login with standard_user
  await loginPage.navigate();
  await loginPage.login(TestData.users.standard, TestData.passwords.standard);
  await expect(page).toHaveURL(TestData.urls.inventory);

  // 2. Add Sauce Labs Bike Light to the cart
  await inventoryPage.addItemToCart(TestData.products.bikeLight);
  await inventoryPage.verifyCartBadgeCount('1');

  // 3. Go to cart
  await inventoryPage.goToCart();
  await expect(page).toHaveURL(TestData.urls.cart);

  // 4. Remove the item
  await checkoutPage.removeItem(TestData.products.bikeLight);

  // 5. Verify the cart badge is empty
  await checkoutPage.verifyCartBadgeIsEmpty();
});

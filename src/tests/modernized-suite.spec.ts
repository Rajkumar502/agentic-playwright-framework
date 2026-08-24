import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';
import { TestData } from '../data/test-data';

test.describe('Modernized Enterprise E2E Test Suite', () => {
  test('should successfully complete the end-to-end shopping and checkout journey', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Navigate and login with standard user
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);
    await expect(page).toHaveURL(TestData.urls.inventory);

    // 2. Add product to cart and verify badge increment
    await inventoryPage.addItemToCart(TestData.products.bikeLight);
    await inventoryPage.verifyCartBadgeCount('1');

    // 3. Navigate to cart
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(TestData.urls.cart);

    // 4. Proceed through checkout with valid details
    await checkoutPage.proceedToCheckout();
    await checkoutPage.fillCustomerDetails('Enterprise', 'Architect', '94107');

    // 5. Complete order and verify success message
    await checkoutPage.finishCheckout();
    await checkoutPage.verifyOrderSuccessMessage('Thank you for your order!');
  });
});
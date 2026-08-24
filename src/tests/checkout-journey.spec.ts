import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';
import { TestData } from '../data/test-data';

test.describe('SauceDemo Checkout Journey', () => {
  test('should successfully complete the checkout journey for standard user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Navigate and login with standard_user
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);
    await expect(page).toHaveURL(TestData.urls.inventory);

    // 2. Add the Sauce Labs Backpack to the cart
    // Note: requirement specifically mentions Sauce Labs Backpack
    const backpackProduct = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCart(backpackProduct);
    await inventoryPage.verifyCartBadgeCount('1');

    // 3. Go to cart
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(TestData.urls.cart);

    // 4. Proceed to checkout with customer details
    await checkoutPage.proceedToCheckout();
    await checkoutPage.fillCustomerDetails('John', 'Doe', '12345');

    // 5. Fill payment/finish checkout and verify successful order completion
    await checkoutPage.finishCheckout();
    await checkoutPage.verifyOrderSuccessMessage('Thank you for your order!');
  });
});
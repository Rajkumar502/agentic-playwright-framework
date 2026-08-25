import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';
import { TestData } from '../data/test-data';

test.describe('SCRUM-2: Checkout Postal Code Validation', () => {
  test('Verify checkout fails when postal code is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Login with standard user
    await loginPage.navigate();
    await loginPage.login(TestData.users.standard, TestData.passwords.standard);

    // Step 2: Add product to cart and proceed to checkout information page
    await inventoryPage.addItemToCart(TestData.products.bikeLight);
    await inventoryPage.goToCart();
    await checkoutPage.proceedToCheckout();

    // Step 3: Fill First Name and Last Name, but leave Zip/Postal Code empty, then click Continue
    await checkoutPage.fillCustomerDetails('John', 'Doe', '');

    // Step 4: Verify the error message states 'Error: Postal Code is required'
    await checkoutPage.verifyErrorMessageContains('Error: Postal Code is required');
  });
});
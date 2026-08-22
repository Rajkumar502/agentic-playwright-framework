import { test, expect } from '../fixtures/agent.fixture';
import { TestData } from '../data/test-data';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';

test('Complete SauceDemo checkout journey', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.navigate();
  await loginPage.login(TestData.users.standard, TestData.passwords.secret);
  await expect(page).toHaveURL(new RegExp(TestData.urls.inventory));

  await inventoryPage.addProductToCart(TestData.products.backpack);
  await inventoryPage.verifyCartBadgeCount('1');

  await inventoryPage.goToCart();
  await expect(page).toHaveURL(new RegExp(TestData.urls.cart));

  await checkoutPage.proceedToCheckout();
  await expect(page).toHaveURL(new RegExp(TestData.urls.checkoutStepOne));

  await checkoutPage.fillCustomerInfo(
    TestData.customer.firstName,
    TestData.customer.lastName,
    TestData.customer.postalCode
  );

  await checkoutPage.completeCheckout();
  await expect(page).toHaveURL(new RegExp(TestData.urls.checkoutComplete));
  await checkoutPage.verifyOrderComplete(TestData.messages.successHeader);
});
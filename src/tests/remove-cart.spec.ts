import { test, expect } from '@playwright/test';
import { TestData } from '../data/test-data';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';

test('Verify user can add and remove Sauce Labs Bike Light from cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.navigate();
  await loginPage.login(TestData.users.standard, TestData.passwords.standard);

  await inventoryPage.addItemToCart(TestData.products.bikeLight);
  await inventoryPage.verifyCartBadgeCount('1');
  await inventoryPage.goToCart();

  await checkoutPage.removeItem(TestData.products.bikeLight);
  await checkoutPage.verifyCartBadgeIsEmpty();
});

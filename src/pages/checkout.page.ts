import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  private get cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  private productRemoveButton(productName: string) {
    return this.page.locator(`.cart_item:has-text("${productName}") button`);
  }

  async removeItem(productName: string) {
    await this.productRemoveButton(productName).click();
  }

  async verifyCartBadgeIsEmpty() {
    await expect(this.cartBadge).not.toBeVisible();
  }
}

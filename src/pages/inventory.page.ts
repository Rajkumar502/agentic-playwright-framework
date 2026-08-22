import { Page, expect } from '@playwright/test';

export class InventoryPage {
  constructor(private page: Page) {}

  private get cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  private get cartLink() {
    return this.page.locator('.shopping_cart_link');
  }

  private productAddToCartButton(productName: string) {
    return this.page.locator(`.inventory_item:has-text("${productName}") button`);
  }

  async addItemToCart(productName: string) {
    await this.productAddToCartButton(productName).click();
  }

  async verifyCartBadgeCount(expectedCount: string) {
    await expect(this.cartBadge).toHaveText(expectedCount);
  }

  async goToCart() {
    await this.cartLink.click();
  }
}

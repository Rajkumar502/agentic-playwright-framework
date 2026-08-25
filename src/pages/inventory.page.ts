import { Page, expect } from '@playwright/test';

export class InventoryPage {
  constructor(private page: Page) {}

  private get cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  private get cartLink() {
    return this.page.locator('.shopping_cart_link');
  }

  private get sortDropdown() {
    return this.page.locator('.product_sort_container');
  }

  private get firstInventoryItemName() {
    return this.page.locator('.inventory_item_name').first();
  }

  private get burgerMenuButton() {
    return this.page.getByRole('button', { name: 'Open Menu' });
  }

  private get logoutSidebarLink() {
    return this.page.getByRole('link', { name: 'Logout' });
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

  async sortByPriceLowToHigh() {
    await this.sortDropdown.selectOption('lohi');
  }

  async verifyFirstItemName(expectedName: string) {
    await expect(this.firstInventoryItemName).toHaveText(expectedName);
  }

  async openSidebarMenu() {
    await this.burgerMenuButton.click();
  }

  async clickLogout() {
    await expect(this.logoutSidebarLink).toBeVisible();
    await this.logoutSidebarLink.click();
  }
}
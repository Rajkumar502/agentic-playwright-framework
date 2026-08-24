import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  private get cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  private get checkoutButton() {
    return this.page.locator('#checkout');
  }

  private get firstNameInput() {
    return this.page.locator('#first-name');
  }

  private get lastNameInput() {
    return this.page.locator('#last-name');
  }

  private get postalCodeInput() {
    return this.page.locator('#postal-code');
  }

  private get continueButton() {
    return this.page.locator('#continue');
  }

  private get finishButton() {
    return this.page.locator('#finish');
  }

  private get completeHeader() {
    return this.page.locator('.complete-header');
  }

  private get errorMessage() {
    return this.page.locator('[data-test="error"]');
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

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async fillCustomerDetails(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }

  async verifyOrderSuccessMessage(expectedMessage: string) {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toHaveText(expectedMessage);
  }

  async verifyErrorMessageContains(expectedMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }
}
import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  private cartItem(productName: string) {
    return this.page.locator('.cart_item', { hasText: productName });
  }

  private itemQuantity(productName: string) {
    return this.cartItem(productName).locator('.cart_quantity');
  }

  private itemPrice(productName: string) {
    return this.cartItem(productName).locator('.inventory_item_price');
  }

  private itemSubtotal(productName: string) {
    return this.cartItem(productName).locator('.item_pricebar');
  }

  private quantityInput(productName: string) {
    return this.cartItem(productName).locator('.cart_quantity_input');
  }

  async verifyItemQuantity(productName: string, expectedQuantity: string) {
    const quantityElement = this.itemQuantity(productName);
    await expect(quantityElement).toBeVisible();
    // Note: Sauce Demo standard cart displays quantity as text. If your implementation uses an input, adapt accordingly.
    const text = await quantityElement.textContent();
    expect(text?.trim()).toBe(expectedQuantity);
  }

  async getItemPrice(productName: string): Promise<number> {
    const priceText = await this.itemPrice(productName).textContent();
    if (!priceText) throw new Error(`Price not found for product: ${productName}`);
    return parseFloat(priceText.replace('$', '').trim());
  }

  async verifyItemSubtotal(productName: string, expectedPrice: number) {
    const subtotalText = await this.itemSubtotal(productName).textContent();
    if (!subtotalText) throw new Error(`Subtotal not found for product: ${productName}`);
    const subtotal = parseFloat(subtotalText.replace('$', '').trim());
    expect(subtotal).toBe(expectedPrice);
  }

  async updateItemQuantity(productName: string, newQuantity: string) {
    const input = this.quantityInput(productName);
    if (await input.count() > 0) {
      await input.fill(newQuantity);
      await input.press('Enter');
    } else {
      // Fallback if application uses standard dropdown or buttons for quantity update
      throw new Error(`Quantity input field not found for product: ${productName}`);
    }
  }

  async verifyCalculatedSubtotal(productName: string, unitPrice: number, quantity: string) {
    const expectedSubtotal = unitPrice * parseInt(quantity, 10);
    const subtotalText = await this.itemSubtotal(productName).textContent();
    if (!subtotalText) throw new Error(`Subtotal not found for product: ${productName}`);
    const actualSubtotal = parseFloat(subtotalText.replace('$', '').trim());
    expect(actualSubtotal).toBeCloseTo(expectedSubtotal, 2);
  }
}

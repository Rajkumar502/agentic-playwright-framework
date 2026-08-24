import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private get usernameInput() {
    return this.page.locator('#user-name');
  }

  private get passwordInput() {
    return this.page.locator('#password');
  }

  private get loginButton() {
    return this.page.locator('#login-button');
  }

  private get errorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  async navigate() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async verifyErrorMessageContains(expectedMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }
}
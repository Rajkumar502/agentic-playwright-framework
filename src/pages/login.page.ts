import { Page } from '@playwright/test';

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

  async navigate() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

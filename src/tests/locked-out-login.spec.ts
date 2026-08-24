import { test, expect } from '../fixtures/agent.fixture';
import { LoginPage } from '../pages/login.page';
import { TestData } from '../data/test-data';

test.describe('SauceDemo Locked Out User Login', () => {
  test('should display locked out error message for locked_out_user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('locked_out_user', TestData.passwords.standard);

    await loginPage.verifyErrorMessageContains('Epic sadface: Sorry, this user has been locked out');
  });
});
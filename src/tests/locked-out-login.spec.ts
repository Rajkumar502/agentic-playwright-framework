import { test } from '@playwright/test';
import { TestData } from '../data/test-data';
import { LoginPage } from '../pages/login.page';

test.describe('SauceDemo Login Authentication Tests', () => {
  test('should display locked out error message for locked_out_user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(TestData.users.lockedOutUser, TestData.passwords.secretSauce);

    await loginPage.verifyErrorMessage(TestData.messages.lockedOutError);
  });
});
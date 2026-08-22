import { defineConfig, devices } from '@playwright/test';
import { runPreFlightCheck } from './src/config/preflight';
import dotenv from 'dotenv';
dotenv.config();

// Execute pre-flight check before test run
(async () => {
  await runPreFlightCheck();
})();

export default defineConfig({
  testDir: './src/tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

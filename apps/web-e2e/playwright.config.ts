import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import * as path from 'path';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:3000';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),

  // Test timeout
  timeout: 30 * 1000,

  // Test file patterns
  testMatch: ['**/*.{e2e,spec}.{js,jsx,ts,tsx}'],

  // Global test timeout
  globalTimeout: 10 * 60 * 1000, // 10 minutes

  // Expect timeout
  expect: {
    timeout: 5000,
  },

  // Maximum workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Use custom test results directory
  outputDir: 'test-results/',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Video recording
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Accept downloads
    acceptDownloads: true,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'UTC',

    // Permissions
    permissions: ['geolocation', 'notifications'],

    // User agent
    userAgent: 'Mozilla/5.0 (Playwright Testing)',

    // Extra HTTP headers
    extraHTTPHeaders: {
      'X-E2E-Test': 'true',
    },

    // Browser context options
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },

  /* Configure retries */
  retries: process.env.CI ? 2 : 0,

  /* Run tests in fully parallel mode */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'pnpm nx run web:start' : 'pnpm nx run web:dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },

    // Tablet
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },

    // Branded browsers (optional)
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});

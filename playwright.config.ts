import { defineConfig, devices } from '@playwright/test';

/** Browser checks are optional when the host cannot launch a browser. Never tunnel around host policy. */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'qa/playwright-report', open: 'never' }]],
  outputDir: 'qa/playwright-results',
  use: {
    baseURL: 'http://127.0.0.1:3010',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    launchOptions: process.env.QCM_CHROMIUM_PATH
      ? { executablePath: process.env.QCM_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    env: { PORT: '3010' },
    url: 'http://127.0.0.1:3010',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

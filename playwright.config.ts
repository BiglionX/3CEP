import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: process.env.CI ? 'never' : 'on-failure',
        outputFolder: 'playwright-report',
      },
    ],
    [
      'json',
      {
        outputFile: 'test-results/playwright-results.json',
      },
    ],
    [
      'junit',
      {
        outputFile: 'test-results/playwright-junit.xml',
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    // 桌面浏览器测试
    {
      name: 'chromium-desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        browserName: 'firefox',
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        browserName: 'webkit',
        viewport: { width: 1920, height: 1080 },
      },
    },

    // 移动设备测试
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-safari',
      use: {
        browserName: 'webkit',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 820, height: 1180 },
        isMobile: true,
        hasTouch: true,
      },
    },

    // 权限和角色专用测试
    {
      name: 'admin-tests',
      testMatch: '**/e2e/roles-*.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 },
        storageState: 'test-data/admin-storage.json',
      },
    },
    {
      name: 'consumer-tests',
      testMatch: '**/e2e/consumer-*.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        storageState: 'test-data/consumer-storage.json',
      },
    },

    // 企业服务专用测试项目
    {
      name: 'enterprise-functional-tests',
      testMatch: '**/e2e/enterprise/**/*functional*.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://localhost:3003',
      },
    },
    {
      name: 'enterprise-permission-tests',
      testMatch: '**/e2e/enterprise/**/*permission*.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://localhost:3003',
      },
    },
    {
      name: 'enterprise-api-tests',
      testMatch: '**/e2e/enterprise/**/*api*.spec.ts',
      use: {
        browserName: 'chromium',
        ignoreHTTPSErrors: true,
        baseURL: 'http://localhost:3003',
      },
    },
    {
      name: 'enterprise-mobile-tests',
      testMatch: '**/e2e/enterprise/**/*.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        baseURL: 'http://localhost:3003',
      },
    },
  ],
});

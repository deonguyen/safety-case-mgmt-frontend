import { test as base, Page } from '@playwright/test';

export const test = base.extend<{
  authenticatedPage: Page;
  specificationSetupPage: Page;
  specificationMilestonesPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Perform the login steps
    await page.goto('http://localhost:3000/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('http://localhost:3000/');
    // Pass the authenticated page object to the test
    await use(page);
  },
});

export { expect } from '@playwright/test';
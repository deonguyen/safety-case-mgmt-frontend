import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000/login');
  
  // Perform login actions
  await page.fill('input[id="username"]', 'admin'); 
  await page.fill('input[id="password"]', 'admin');
  await page.click('button:has-text("Sign in")');
  
  // Wait for the login to complete and the app to redirect to the home page.
  await page.waitForURL('http://localhost:3000/');
  // A more specific assertion to ensure login was successful.
  await expect(page.getByRole('banner')).toContainText('Welcome, admin');

  await page.context().storageState({ path: authFile });
});

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('should display login form elements', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
  });

  test('should login successfully and redirect to home', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForURL('http://localhost:3000/');
    expect(page.url()).toBe('http://localhost:3000/');
  });
});
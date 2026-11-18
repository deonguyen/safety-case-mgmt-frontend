import { test, expect } from './fixtures';

test.beforeEach(async ({ authenticatedPage }) => {
  // All tests start as authenticated. Navigate to the home page.
  await authenticatedPage.goto('http://localhost:3000/');
});

test('homepage loads successfully', async ({ authenticatedPage }) => {
  // Locate the main container by its ID and assert it is visible
  const mainContainer = authenticatedPage.locator('#maincontainer');
  await expect(mainContainer).toBeVisible();
});
import { test, expect } from "./fixtures";

test.describe("Test Execution Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
  // All tests start as authenticated. Navigate to the home page.
  await authenticatedPage.goto('http://localhost:3000/traceability/test-execution/');
});

  test("should load the test execution page and display the title", async ({ authenticatedPage }) => {
    // Check if the main title is visible
    await expect(authenticatedPage.locator('h1:has-text("Test Execution")')).toBeVisible();

    // Check if the table is present
    await expect(authenticatedPage.locator("table")).toBeVisible();
  });
});
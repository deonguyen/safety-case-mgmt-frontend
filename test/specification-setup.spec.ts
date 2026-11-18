import { test, expect } from "./fixtures";

test.describe("Specification Setup Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // All tests start as authenticated. Navigate to the home page.
    await authenticatedPage.goto('http://localhost:3000/specification-setup/');
  });
  
  test("should load the specification setup page and display the title", async ({ authenticatedPage }) => {
    // Check if the main title is visible
    await expect(authenticatedPage.locator('#specification-setup-title')).toBeVisible();

    // Check if the table is present
    await expect(authenticatedPage.locator("table")).toBeVisible();
  });

  test.describe("Import Specification Flow", () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      // Click the button to initiate the import process
      await authenticatedPage.click('#import-specification-btn');
    });

    test("Inspect all element on the import modal", async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('#import-project-specification-title')).toBeVisible();
      await expect(authenticatedPage.locator('button[data-slot="dialog-close"]')).toBeVisible();
      await expect(authenticatedPage.locator('#source')).toBeVisible();
      await expect(authenticatedPage.locator('#folder_location')).toBeVisible();
      await expect(authenticatedPage.locator('#version')).toBeVisible();
      await expect(authenticatedPage.locator('#import-button')).toBeVisible();
    });
  });
});
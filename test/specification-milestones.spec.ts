import { test, expect } from "./fixtures";

test.describe("Specification Milestones Page", () => {
 test.beforeEach(async ({ authenticatedPage }) => {
   // All tests start as authenticated. Navigate to the home page.
   await authenticatedPage.goto('http://localhost:3000/specification-milestones/');
 });
 
  test("should load the specification milestones page and display the title", async ({
    authenticatedPage,
  }) => {
    // Check if the main title is visible
    await expect(authenticatedPage.locator('#specification-milestones-title')).toBeVisible();

    // Check if the table is present
    await expect(authenticatedPage.locator("table")).toBeVisible();
  });
});
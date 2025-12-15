// import { test, expect } from "@playwright/test";

// // Generate 100 tests for  testing
// for (let i = 1; i <= 100; i++) {
//   test(`Load test ${i} - has title`, async ({ page }) => {
//   // test("has title", async ({ page }) => {
//     await page.goto("https://playwright.dev/");

//     // Expect a title "to contain" a substring.
//     await expect(page).toHaveTitle(/Playwright/);
//   });

//   test(`Load test ${i} - get started link`, async ({ page }) => {
//   // test("get started link", async ({ page }) => {
//     await page.goto("https://playwright.dev/");

//     // Click the get started link.
//     await page.getByRole("link", { name: "Get started" }).click();

//     // Expects page to have a heading with the name of Installation.
//     await expect(page.getByRole("heading", { name: "Installation" })).toBeVisible();
//   });
//   test(`Load test ${i} - navigation test`, async ({ page }) => {
//   // test(`Load test  - navigation test`, async ({ page }) => {

//     await page.goto("https://playwright.dev/");

//     // Test navigation to docs
//     await page.getByRole("link", { name: "Docs" }).click();
//     await expect(page).toHaveURL(/.*docs.*/);
//   });

//   test(`Load test ${i} - API reference`, async ({ page }) => {
//     await page.goto("https://playwright.dev/");

//     // Navigate to API
//     await page.getByRole("link", { name: "API" }).click();
//     await expect(page.getByRole("heading", { name: "API reference" })).toBeVisible();
//   });

//   test(`Load test ${i} - community link`, async ({ page }) => {
//     await page.goto("https://playwright.dev/");

//     // Test community link
//     await page.getByRole("link", { name: "Community" }).click();
//     await expect(page.getByRole("heading", { name: "Community" })).toBeVisible();
//   });
// }

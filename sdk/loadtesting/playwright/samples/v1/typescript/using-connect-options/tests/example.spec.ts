import { test, expect } from "@playwright/test";
import { writeFileSync } from "fs";
import { gzipSync } from "zlib";

// Generate 100 iterations of each test
for (let i = 1; i <= 2; i++) {
  test(`has title - iteration ${i}`, async ({ page }) => {
  // test("has title", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test(`get started link - iteration ${i}`, async ({ page }) => {
  // test("get started link", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Click the get started link.
    await page.getByRole("link", { name: "Get started" }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole("heading", { name: "Installation" })).toBeVisible();
  });

  test(`capture rich artifacts for report - iteration ${i}`, async ({ page }, testInfo) => {
  // test("capture rich artifacts for report", async ({ page }, testInfo) => {
    await page.goto("https://playwright.dev/");

    // Capture a manual screenshot attachment regardless of test outcome.
    const screenshotPath = testInfo.outputPath(`homepage-${i}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach(`homepage-screenshot-${i}`, {
      path: screenshotPath,
      contentType: "image/png",
    });

    // Generate a small text file and attach it so it shows up in the report.
    const textPath = testInfo.outputPath(`notes-${i}.txt`);
    writeFileSync(textPath, `Playwright artifact attachment demo - iteration ${i}`);
    await testInfo.attach(`notes-file-${i}`, {
      path: textPath,
      contentType: "text/plain",
    });

    // Produce a gzip archive attachment to showcase binary downloads.
    const gzipPath = testInfo.outputPath(`data-${i}.txt.gz`);
    writeFileSync(gzipPath, gzipSync(`Compressed artifact content - iteration ${i}`));
    await testInfo.attach(`compressed-artifact-${i}`, {
      path: gzipPath,
      contentType: "application/gzip",
    });

    // Trigger a browser download and attach the resulting file.
    await page.setContent(
      `<a href="data:text/plain,Sample%20download%20${i}" download="sample-${i}.txt">Download</a>`,
    );
    const downloadPromise = page.waitForEvent("download");
    await page.getByText("Download").click();
    const download = await downloadPromise;
    const downloadPath = testInfo.outputPath(download.suggestedFilename() || `sample-${i}.txt`);
    await download.saveAs(downloadPath);
    await testInfo.attach(`browser-download-${i}`, {
      path: downloadPath,
      contentType: "text/plain",
    });
  });
}

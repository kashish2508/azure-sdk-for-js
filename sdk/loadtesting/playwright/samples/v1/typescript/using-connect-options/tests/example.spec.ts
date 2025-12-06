import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { gzipSync } from 'zlib';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('capture rich artifacts for report', async ({ page }, testInfo) => {
  await page.goto('https://playwright.dev/');

  // Capture a manual screenshot attachment regardless of test outcome.
  const screenshotPath = testInfo.outputPath('homepage.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach('homepage-screenshot', {
    path: screenshotPath,
    contentType: 'image/png',
  });

  // Generate a small text file and attach it so it shows up in the report.
  const textPath = testInfo.outputPath('notes.txt');
  writeFileSync(textPath, 'Playwright artifact attachment demo');
  await testInfo.attach('notes-file', {
    path: textPath,
    contentType: 'text/plain',
  });

  // Produce a gzip archive attachment to showcase binary downloads.
  const gzipPath = testInfo.outputPath('data.txt.gz');
  writeFileSync(gzipPath, gzipSync('Compressed artifact content'));
  await testInfo.attach('compressed-artifact', {
    path: gzipPath,
    contentType: 'application/gzip',
  });

  // Trigger a browser download and attach the resulting file.
  await page.setContent('<a href="data:text/plain,Sample%20download" download="sample.txt">Download</a>');
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Download').click();
  const download = await downloadPromise;
  const downloadPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(downloadPath);
  await testInfo.attach('browser-download', {
    path: downloadPath,
    contentType: 'text/plain',
  });
});

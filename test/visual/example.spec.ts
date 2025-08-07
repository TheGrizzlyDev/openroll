import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';

// Build the app before running visual tests

test.beforeAll(() => {
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env, SKIP_ICONS: '1' }
  });
});

test('homepage has no visual regressions', async ({ page }) => {
  const filePath = path.join(process.cwd(), 'dist', 'index.html');
  await page.goto(`file://${filePath}`);
  await expect(page).toHaveScreenshot('homepage.png');
});

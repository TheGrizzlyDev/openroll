import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{ext}',
});

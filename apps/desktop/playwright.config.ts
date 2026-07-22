import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'renderer-contract',
      testMatch: /smoke\/renderer-baseline\.spec\.ts/,
    },
    {
      name: 'desktop-launch',
      testMatch: /desktop\/desktop-launch\.spec\.ts/,
    },
  ],
});

import { expect, test } from '@playwright/test';
import { _electron as electron } from 'playwright';

test('packaged desktop app открывает главное окно', async () => {
  const executablePath = process.env.DESENGINE_DESKTOP_EXECUTABLE;

  test.skip(
    !executablePath,
    'Укажите DESENGINE_DESKTOP_EXECUTABLE для smoke-проверки packaged desktop app.',
  );

  const app = await electron.launch({ executablePath });

  try {
    const window = await app.firstWindow();
    await expect(window.locator('text=desengine').first()).toBeVisible();
    await expect(window.locator('text=/protocol 0\\.0\\.1/')).toBeVisible();
  } finally {
    await app.close();
  }
});

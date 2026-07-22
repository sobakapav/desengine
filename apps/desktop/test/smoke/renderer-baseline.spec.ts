import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

test('renderer baseline связан с React, Tailwind и protocol package', async () => {
  const appSource = await fs.readFile(path.join(process.cwd(), 'src/App.tsx'), 'utf8');
  const rendererSource = await fs.readFile(path.join(process.cwd(), 'src/renderer.tsx'), 'utf8');
  const stylesSource = await fs.readFile(path.join(process.cwd(), 'src/index.css'), 'utf8');

  expect(rendererSource).toContain("import { createRoot } from 'react-dom/client'");
  expect(appSource).toContain("from '@desengine/protocol'");
  expect(appSource).toContain('DESENGINE_PROTOCOL_VERSION');
  expect(stylesSource).toContain('@import "tailwindcss"');
});

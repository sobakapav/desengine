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

test('dev handoff связан с Figma plugin и loopback endpoint', async () => {
  const mainSource = await fs.readFile(path.join(process.cwd(), 'src/index.ts'), 'utf8');
  const preloadSource = await fs.readFile(path.join(process.cwd(), 'src/preload.ts'), 'utf8');
  const pluginSource = await fs.readFile(
    path.join(process.cwd(), '../figma-plugin/src/code.ts'),
    'utf8',
  );
  const pluginManifest = await fs.readFile(
    path.join(process.cwd(), '../figma-plugin/manifest.json'),
    'utf8',
  );

  expect(mainSource).toContain('127.0.0.1');
  expect(mainSource).toContain('/figma/selection');
  expect(mainSource).toContain('figmaSelectionPingSchema');
  expect(preloadSource).toContain('onFigmaSelectionPing');
  expect(pluginSource).toContain('DESENGINE_DEV_HANDOFF_PORT');
  expect(pluginSource).toContain('http://localhost');
  expect(pluginManifest).toContain('"main": "dist/code.js"');
  expect(pluginManifest).toContain('http://localhost:37645');
});

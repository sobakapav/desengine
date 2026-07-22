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
  const appSource = await fs.readFile(path.join(process.cwd(), 'src/App.tsx'), 'utf8');
  const forgeSource = await fs.readFile(path.join(process.cwd(), 'forge.config.ts'), 'utf8');
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
  expect(mainSource).toContain('/figma/selection/latest');
  expect(mainSource).toContain('/figma/visual-snapshot');
  expect(mainSource).toContain('/figma/visual-snapshot/latest');
  expect(mainSource).toContain('figmaSelectionPingSchema');
  expect(mainSource).toContain('figmaVisualSnapshotSchema');
  expect(mainSource).toContain('BrowserWindow.getAllWindows()');
  expect(mainSource).toContain('[desengine:desktop-endpoint]');
  expect(mainSource).toContain('[desengine:desktop-ipc]');
  expect(preloadSource).toContain('onFigmaSelectionPing');
  expect(preloadSource).toContain('getLastFigmaSelectionPing');
  expect(preloadSource).toContain('onFigmaVisualSnapshot');
  expect(preloadSource).toContain('getLastFigmaVisualSnapshot');
  expect(preloadSource).toContain('[desengine:preload]');
  expect(appSource).toContain('http://localhost:37645/figma/selection/latest');
  expect(appSource).toContain('http://localhost:37645/figma/visual-snapshot/latest');
  expect(appSource).toContain('<img');
  expect(forgeSource).toContain('devContentSecurityPolicy');
  expect(forgeSource).toContain('connect-src');
  expect(forgeSource).toContain('http://localhost:*');
  expect(appSource).toContain('[desengine:renderer]');
  expect(pluginSource).toContain('DESENGINE_DEV_HANDOFF_PORT');
  expect(pluginSource).toContain('http://localhost');
  expect(pluginSource).toContain('[desengine:figma]');
  expect(pluginSource).toContain('exportAsync');
  expect(pluginSource).toContain('data:image/png;base64');
  expect(pluginManifest).toContain('"main": "dist/code.js"');
  expect(pluginManifest).toContain('http://localhost:37645');
});

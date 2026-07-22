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
  const visualSnapshotSource = await fs.readFile(
    path.join(process.cwd(), '../figma-plugin/src/visual-snapshot.ts'),
    'utf8',
  );
  const explodedFrameSource = await fs.readFile(
    path.join(process.cwd(), '../figma-plugin/src/exploded-frame.ts'),
    'utf8',
  );
  const pluginUiSource = await fs.readFile(
    path.join(process.cwd(), '../figma-plugin/src/ui.html'),
    'utf8',
  );
  const pluginManifest = await fs.readFile(
    path.join(process.cwd(), '../figma-plugin/manifest.json'),
    'utf8',
  );
  const protocolSource = await fs.readFile(
    path.join(process.cwd(), '../../packages/protocol/src/index.ts'),
    'utf8',
  );

  expect(mainSource).toContain('127.0.0.1');
  expect(protocolSource).toContain("DESENGINE_SELECTION_PING_ROUTE = '/figma/selection'");
  expect(protocolSource).toContain(
    "DESENGINE_SELECTION_PING_LATEST_ROUTE = '/figma/selection/latest'",
  );
  expect(protocolSource).toContain("DESENGINE_VISUAL_SNAPSHOT_ROUTE = '/figma/visual-snapshot'");
  expect(protocolSource).toContain(
    "DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE = '/figma/visual-snapshot/latest'",
  );
  expect(protocolSource).toContain("DESENGINE_EXPLODED_FRAME_ROUTE = '/figma/exploded-frame'");
  expect(protocolSource).toContain(
    "DESENGINE_EXPLODED_FRAME_LATEST_ROUTE = '/figma/exploded-frame/latest'",
  );
  expect(protocolSource).toContain('DESENGINE_EXPLODED_FRAME_MAX_CELLS = 100');
  expect(protocolSource).toContain('DESENGINE_EXPLODED_FRAME_MAX_DEPTH = 4');
  expect(protocolSource).toContain('stopReason');
  expect(protocolSource).toContain('parentNodeId');
  expect(protocolSource).toContain('depth');
  expect(protocolSource).toContain('path');
  expect(protocolSource).toContain('createDevHandoffUrl');
  expect(protocolSource).toContain('figmaExplodedFrameSnapshotSchema');
  expect(mainSource).toContain('DESENGINE_SELECTION_PING_ROUTE');
  expect(mainSource).toContain('DESENGINE_SELECTION_PING_LATEST_ROUTE');
  expect(mainSource).toContain('DESENGINE_VISUAL_SNAPSHOT_ROUTE');
  expect(mainSource).toContain('DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE');
  expect(mainSource).toContain('DESENGINE_EXPLODED_FRAME_ROUTE');
  expect(mainSource).toContain('DESENGINE_EXPLODED_FRAME_LATEST_ROUTE');
  expect(mainSource).toContain('figmaSelectionPingSchema');
  expect(mainSource).toContain('figmaVisualSnapshotSchema');
  expect(mainSource).toContain('figmaExplodedFrameSnapshotSchema');
  expect(mainSource).toContain('BrowserWindow.getAllWindows()');
  expect(mainSource).toContain('[desengine:desktop-endpoint]');
  expect(mainSource).toContain('[desengine:desktop-ipc]');
  expect(preloadSource).toContain('onFigmaSelectionPing');
  expect(preloadSource).toContain('getLastFigmaSelectionPing');
  expect(preloadSource).toContain('onFigmaVisualSnapshot');
  expect(preloadSource).toContain('getLastFigmaVisualSnapshot');
  expect(preloadSource).toContain('onFigmaExplodedFrame');
  expect(preloadSource).toContain('getLastFigmaExplodedFrame');
  expect(preloadSource).toContain('[desengine:preload]');
  expect(appSource).toContain('createDevHandoffUrl');
  expect(appSource).toContain('DESENGINE_SELECTION_PING_LATEST_ROUTE');
  expect(appSource).toContain('DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE');
  expect(appSource).toContain('DESENGINE_EXPLODED_FRAME_LATEST_ROUTE');
  expect(appSource).toContain('ExplodedFrameView');
  expect(appSource).toContain('<img');
  expect(forgeSource).toContain('devContentSecurityPolicy');
  expect(forgeSource).toContain('connect-src');
  expect(forgeSource).toContain('http://localhost:*');
  expect(appSource).toContain('[desengine:renderer]');
  expect(pluginSource).toContain('createDevHandoffUrl');
  expect(pluginSource).toContain('DESENGINE_SELECTION_PING_ROUTE');
  expect(pluginSource).toContain('DESENGINE_VISUAL_SNAPSHOT_ROUTE');
  expect(pluginSource).toContain('DESENGINE_EXPLODED_FRAME_ROUTE');
  expect(pluginSource).toContain('exportNodeAsPngVisualSnapshot');
  expect(pluginSource).toContain('exportAutoLayoutFrameAsExplodedSnapshot');
  expect(pluginSource).toContain('[desengine:figma]');
  expect(visualSnapshotSource).toContain('exportNodeAsPngVisualSnapshot');
  expect(visualSnapshotSource).toContain('exportAsync');
  expect(visualSnapshotSource).toContain('data:image/png;base64');
  expect(explodedFrameSource).toContain('canExportAutoLayoutFrame');
  expect(explodedFrameSource).toContain('DESENGINE_EXPLODED_FRAME_MAX_CELLS');
  expect(explodedFrameSource).toContain('DESENGINE_EXPLODED_FRAME_MAX_DEPTH');
  expect(explodedFrameSource).toContain('collectExplodedLeaves');
  expect(explodedFrameSource).toContain('stopReason');
  expect(explodedFrameSource).toContain('frame.children');
  expect(explodedFrameSource).toContain('absoluteBoundingBox');
  expect(pluginUiSource).toContain('Создать взрыв-схему');
  expect(pluginUiSource).toContain('desengine:create-exploded-frame');
  expect(pluginManifest).toContain('"main": "dist/code.js"');
  expect(pluginManifest).toContain('http://localhost:37645');
});

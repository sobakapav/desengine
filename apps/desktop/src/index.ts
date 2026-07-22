import { app, BrowserWindow, ipcMain } from 'electron';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';

import {
  DESENGINE_DEV_HANDOFF_PORT,
  DESENGINE_EXPLODED_FRAME_LATEST_ROUTE,
  DESENGINE_EXPLODED_FRAME_ROUTE,
  DESENGINE_HEALTH_ROUTE,
  DESENGINE_MAX_MESSAGE_BYTES,
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_SELECTION_PING_LATEST_ROUTE,
  DESENGINE_SELECTION_PING_ROUTE,
  DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE,
  DESENGINE_VISUAL_SNAPSHOT_ROUTE,
  figmaExplodedFrameSnapshotSchema,
  figmaSelectionPingSchema,
  figmaVisualSnapshotSchema,
  protocolStatusSchema,
  type FigmaExplodedFrameSnapshot,
  type FigmaSelectionPing,
  type FigmaVisualSnapshot,
  type ProtocolStatus,
} from '@desengine/protocol';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | undefined;
let handoffServer: http.Server | undefined;
let lastFigmaSelectionPing: FigmaSelectionPing | undefined;
let lastFigmaVisualSnapshot: FigmaVisualSnapshot | undefined;
let lastFigmaExplodedFrameSnapshot: FigmaExplodedFrameSnapshot | undefined;

if (require('electron-squirrel-startup')) {
  app.quit();
}

function sendJson(response: ServerResponse, statusCode: number, payload: ProtocolStatus) {
  console.log('[desengine:desktop-endpoint] response', {
    statusCode,
    payload,
  });

  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(protocolStatusSchema.parse(payload)));
}

function sendRawJson(response: ServerResponse, statusCode: number, payload: unknown) {
  console.log('[desengine:desktop-endpoint] raw response', {
    statusCode,
    payload,
  });

  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8');

      if (Buffer.byteLength(body, 'utf8') > DESENGINE_MAX_MESSAGE_BYTES) {
        reject(new Error('payload-too-large'));
        request.destroy();
      }
    });

    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function handleSelectionPing(request: IncomingMessage, response: ServerResponse) {
  console.log('[desengine:desktop-endpoint] incoming selection ping');

  try {
    const body = await readRequestBody(request);
    console.log('[desengine:desktop-endpoint] request body read', {
      bytes: Buffer.byteLength(body, 'utf8'),
    });

    const parsed = figmaSelectionPingSchema.safeParse(JSON.parse(body));

    if (!parsed.success) {
      console.warn('[desengine:desktop-endpoint] selection ping rejected', parsed.error);

      sendJson(response, 400, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ok: false,
        code: 'invalid-payload',
        message: 'desengine отклонил Figma ping: payload не прошёл schema validation.',
      });
      return;
    }

    lastFigmaSelectionPing = parsed.data;
    console.log('[desengine:desktop-endpoint] selection ping accepted', lastFigmaSelectionPing);

    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        console.log('[desengine:desktop-ipc] sending ping to renderer window', {
          windowId: window.id,
        });
        window.webContents.send('figma-selection-ping', lastFigmaSelectionPing);
      }
    }

    sendJson(response, 200, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: true,
      code: 'accepted',
      message: 'desengine получил Figma selection ping.',
    });
  } catch (error) {
    console.error('[desengine:desktop-endpoint] selection ping failed', error);

    sendJson(response, error instanceof Error && error.message === 'payload-too-large' ? 413 : 400, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: false,
      code: error instanceof Error && error.message === 'payload-too-large'
        ? 'payload-too-large'
        : 'invalid-payload',
      message: 'desengine не смог прочитать Figma ping.',
    });
  }
}

async function handleVisualSnapshot(request: IncomingMessage, response: ServerResponse) {
  console.log('[desengine:desktop-endpoint] incoming visual snapshot');

  try {
    const body = await readRequestBody(request);
    console.log('[desengine:desktop-endpoint] visual snapshot body read', {
      bytes: Buffer.byteLength(body, 'utf8'),
    });

    const parsed = figmaVisualSnapshotSchema.safeParse(JSON.parse(body));

    if (!parsed.success) {
      console.warn('[desengine:desktop-endpoint] visual snapshot rejected', parsed.error);

      sendJson(response, 400, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ok: false,
        code: 'invalid-payload',
        message: 'desengine отклонил visual snapshot: payload не прошёл schema validation.',
      });
      return;
    }

    lastFigmaVisualSnapshot = parsed.data;
    console.log('[desengine:desktop-endpoint] visual snapshot accepted', {
      nodeId: lastFigmaVisualSnapshot.nodeId,
      nodeName: lastFigmaVisualSnapshot.nodeName,
      nodeType: lastFigmaVisualSnapshot.nodeType,
      width: lastFigmaVisualSnapshot.width,
      height: lastFigmaVisualSnapshot.height,
      dataUrlLength: lastFigmaVisualSnapshot.image.dataUrl.length,
    });

    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        console.log('[desengine:desktop-ipc] sending visual snapshot to renderer window', {
          windowId: window.id,
        });
        window.webContents.send('figma-visual-snapshot', lastFigmaVisualSnapshot);
      }
    }

    sendJson(response, 200, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: true,
      code: 'accepted',
      message: 'desengine получил визуальный снимок из Figma.',
    });
  } catch (error) {
    console.error('[desengine:desktop-endpoint] visual snapshot failed', error);

    sendJson(response, error instanceof Error && error.message === 'payload-too-large' ? 413 : 400, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: false,
      code: error instanceof Error && error.message === 'payload-too-large'
        ? 'payload-too-large'
        : 'invalid-payload',
      message: 'desengine не смог прочитать visual snapshot.',
    });
  }
}

async function handleExplodedFrameSnapshot(request: IncomingMessage, response: ServerResponse) {
  console.log('[desengine:desktop-endpoint] incoming exploded frame snapshot');

  try {
    const body = await readRequestBody(request);
    console.log('[desengine:desktop-endpoint] exploded frame body read', {
      bytes: Buffer.byteLength(body, 'utf8'),
    });

    const parsed = figmaExplodedFrameSnapshotSchema.safeParse(JSON.parse(body));

    if (!parsed.success) {
      console.warn('[desengine:desktop-endpoint] exploded frame rejected', parsed.error);

      sendJson(response, 400, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ok: false,
        code: 'invalid-payload',
        message: 'desengine отклонил exploded frame: payload не прошёл schema validation.',
      });
      return;
    }

    lastFigmaExplodedFrameSnapshot = parsed.data;
    console.log('[desengine:desktop-endpoint] exploded frame accepted', {
      frameId: lastFigmaExplodedFrameSnapshot.frame.nodeId,
      frameName: lastFigmaExplodedFrameSnapshot.frame.nodeName,
      layoutMode: lastFigmaExplodedFrameSnapshot.layoutMode,
      cellCount: lastFigmaExplodedFrameSnapshot.cellCount,
    });

    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        console.log('[desengine:desktop-ipc] sending exploded frame to renderer window', {
          windowId: window.id,
        });
        window.webContents.send('figma-exploded-frame', lastFigmaExplodedFrameSnapshot);
      }
    }

    sendJson(response, 200, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: true,
      code: 'accepted',
      message: 'desengine получил взрыв-схему frame из Figma.',
    });
  } catch (error) {
    console.error('[desengine:desktop-endpoint] exploded frame failed', error);

    sendJson(response, error instanceof Error && error.message === 'payload-too-large' ? 413 : 400, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: false,
      code: error instanceof Error && error.message === 'payload-too-large'
        ? 'payload-too-large'
        : 'invalid-payload',
      message: 'desengine не смог прочитать exploded frame.',
    });
  }
}

function startDevHandoffEndpoint() {
  if (handoffServer) {
    return;
  }

  handoffServer = http.createServer((request, response) => {
    console.log('[desengine:desktop-endpoint] request', {
      method: request.method,
      url: request.url,
    });

    response.setHeader('access-control-allow-origin', '*');
    response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    response.setHeader('access-control-allow-headers', 'content-type');

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === 'GET' && request.url === DESENGINE_HEALTH_ROUTE) {
      sendJson(response, 200, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ok: true,
        code: 'accepted',
        message: 'desengine dev handoff endpoint доступен.',
      });
      return;
    }

    if (request.method === 'GET' && request.url === DESENGINE_SELECTION_PING_LATEST_ROUTE) {
      sendRawJson(response, 200, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ping: lastFigmaSelectionPing,
      });
      return;
    }

    if (request.method === 'GET' && request.url === DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE) {
      sendRawJson(response, 200, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        snapshot: lastFigmaVisualSnapshot,
      });
      return;
    }

    if (request.method === 'GET' && request.url === DESENGINE_EXPLODED_FRAME_LATEST_ROUTE) {
      sendRawJson(response, 200, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        snapshot: lastFigmaExplodedFrameSnapshot,
      });
      return;
    }

    if (request.method === 'POST' && request.url === DESENGINE_SELECTION_PING_ROUTE) {
      handleSelectionPing(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === DESENGINE_VISUAL_SNAPSHOT_ROUTE) {
      handleVisualSnapshot(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === DESENGINE_EXPLODED_FRAME_ROUTE) {
      handleExplodedFrameSnapshot(request, response);
      return;
    }

    sendJson(response, 404, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: false,
      code: 'invalid-payload',
      message: 'Неизвестный dev handoff route.',
    });
  });

  handoffServer.listen(DESENGINE_DEV_HANDOFF_PORT, '127.0.0.1', () => {
    console.log('[desengine:desktop-endpoint] listening', {
      host: '127.0.0.1',
      port: DESENGINE_DEV_HANDOFF_PORT,
    });
  });
}

const createWindow = (): void => {
  const window = new BrowserWindow({
    height: 720,
    minHeight: 560,
    minWidth: 860,
    show: false,
    width: 1080,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: true,
    },
  });
  mainWindow = window;

  window.once('ready-to-show', () => {
    window.show();
  });

  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (!app.isPackaged) {
    window.webContents.openDevTools({ mode: 'detach' });
  }
};

app.on('ready', () => {
  ipcMain.handle('figma-selection-ping:get-last', () => {
    console.log('[desengine:desktop-ipc] renderer requested last ping', {
      hasPing: Boolean(lastFigmaSelectionPing),
    });

    return lastFigmaSelectionPing;
  });
  ipcMain.handle('figma-visual-snapshot:get-last', () => {
    console.log('[desengine:desktop-ipc] renderer requested last visual snapshot', {
      hasSnapshot: Boolean(lastFigmaVisualSnapshot),
    });

    return lastFigmaVisualSnapshot;
  });
  ipcMain.handle('figma-exploded-frame:get-last', () => {
    console.log('[desengine:desktop-ipc] renderer requested last exploded frame', {
      hasSnapshot: Boolean(lastFigmaExplodedFrameSnapshot),
    });

    return lastFigmaExplodedFrameSnapshot;
  });
  startDevHandoffEndpoint();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  handoffServer?.close();
  handoffServer = undefined;
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

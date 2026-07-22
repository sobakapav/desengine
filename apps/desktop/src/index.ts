import { app, BrowserWindow } from 'electron';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';

import {
  DESENGINE_DEV_HANDOFF_PORT,
  DESENGINE_MAX_MESSAGE_BYTES,
  DESENGINE_PROTOCOL_VERSION,
  figmaSelectionPingSchema,
  protocolStatusSchema,
  type FigmaSelectionPing,
  type ProtocolStatus,
} from '@desengine/protocol';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | undefined;
let handoffServer: http.Server | undefined;

if (require('electron-squirrel-startup')) {
  app.quit();
}

function sendJson(response: ServerResponse, statusCode: number, payload: ProtocolStatus) {
  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(protocolStatusSchema.parse(payload)));
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
  try {
    const body = await readRequestBody(request);
    const parsed = figmaSelectionPingSchema.safeParse(JSON.parse(body));

    if (!parsed.success) {
      sendJson(response, 400, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ok: false,
        code: 'invalid-payload',
        message: 'desengine отклонил Figma ping: payload не прошёл schema validation.',
      });
      return;
    }

    mainWindow?.webContents.send('figma-selection-ping', parsed.data satisfies FigmaSelectionPing);

    sendJson(response, 200, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: true,
      code: 'accepted',
      message: 'desengine получил Figma selection ping.',
    });
  } catch (error) {
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

function startDevHandoffEndpoint() {
  if (handoffServer) {
    return;
  }

  handoffServer = http.createServer((request, response) => {
    response.setHeader('access-control-allow-origin', '*');
    response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    response.setHeader('access-control-allow-headers', 'content-type');

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, {
        protocolVersion: DESENGINE_PROTOCOL_VERSION,
        ok: true,
        code: 'accepted',
        message: 'desengine dev handoff endpoint доступен.',
      });
      return;
    }

    if (request.method === 'POST' && request.url === '/figma/selection') {
      handleSelectionPing(request, response);
      return;
    }

    sendJson(response, 404, {
      protocolVersion: DESENGINE_PROTOCOL_VERSION,
      ok: false,
      code: 'invalid-payload',
      message: 'Неизвестный dev handoff route.',
    });
  });

  handoffServer.listen(DESENGINE_DEV_HANDOFF_PORT, '127.0.0.1');
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

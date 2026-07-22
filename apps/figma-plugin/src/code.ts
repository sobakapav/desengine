import {
  DESENGINE_DEV_HANDOFF_PORT,
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_PROTOCOL_VERSION,
  type FigmaSelectionPing,
  type ProtocolStatus,
} from '@desengine/protocol';

declare const __html__: string;

const endpointUrl = `http://localhost:${DESENGINE_DEV_HANDOFF_PORT}/figma/selection`;

function readSelectionPing(): FigmaSelectionPing {
  const selectedNodeNames = figma.currentPage.selection.map((node) => node.name);

  const ping: FigmaSelectionPing = {
    protocolVersion: DESENGINE_PROTOCOL_VERSION,
    sessionToken: DESENGINE_DEV_SESSION_TOKEN,
    selectionCount: selectedNodeNames.length,
    selectedNodeNames,
    sentAt: new Date().toISOString(),
  };

  console.log('[desengine:figma] selection ping prepared', ping);

  return ping;
}

function postSelectionSummary() {
  console.log('[desengine:figma] selection changed', {
    selectionCount: figma.currentPage.selection.length,
  });

  figma.ui.postMessage({
    type: 'desengine:selection-summary',
    selectionCount: figma.currentPage.selection.length,
  });
}

figma.showUI(__html__, {
  height: 260,
  title: 'desengine',
  width: 380,
});

postSelectionSummary();

figma.on('selectionchange', postSelectionSummary);

figma.ui.onmessage = async (message) => {
  if (message?.type === 'desengine:close') {
    figma.closePlugin();
    return;
  }

  if (message?.type !== 'desengine:send-selection') {
    return;
  }

  try {
    console.log('[desengine:figma] sending selection ping', { endpointUrl });

    const response = await fetch(endpointUrl, {
      body: JSON.stringify(readSelectionPing()),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const status = (await response.json()) as ProtocolStatus;

    console.log('[desengine:figma] desktop response received', {
      httpOk: response.ok,
      status,
    });

    figma.ui.postMessage({
      type: 'desengine:send-result',
      ok: response.ok && status.ok,
      message: status.message,
    });
  } catch (error) {
    console.error('[desengine:figma] selection ping failed', error);

    figma.ui.postMessage({
      type: 'desengine:send-result',
      ok: false,
      message: 'Desktop-приложение desengine не отвечает на localhost:37645.',
    });
  }
};

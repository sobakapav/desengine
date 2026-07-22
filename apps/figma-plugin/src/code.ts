import {
  DESENGINE_DEV_HANDOFF_PORT,
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_PROTOCOL_VERSION,
  type FigmaSelectionPing,
  type FigmaVisualSnapshot,
  type ProtocolStatus,
} from '@desengine/protocol';

declare const __html__: string;

const selectionEndpointUrl = `http://localhost:${DESENGINE_DEV_HANDOFF_PORT}/figma/selection`;
const visualSnapshotEndpointUrl = `http://localhost:${DESENGINE_DEV_HANDOFF_PORT}/figma/visual-snapshot`;

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function getNodeSize(node: SceneNode) {
  if ('width' in node && 'height' in node) {
    return {
      width: node.width,
      height: node.height,
    };
  }

  return {
    width: 0,
    height: 0,
  };
}

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

async function readVisualSnapshot(): Promise<FigmaVisualSnapshot> {
  const node = figma.currentPage.selection[0];

  if (!node) {
    throw new Error('selection-empty');
  }

  if (!('exportAsync' in node)) {
    throw new Error('node-not-exportable');
  }

  const scale = 2;
  console.log('[desengine:figma] exporting selected node as PNG', {
    id: node.id,
    name: node.name,
    type: node.type,
    scale,
  });

  const bytes = await node.exportAsync({
    constraint: {
      type: 'SCALE',
      value: scale,
    },
    format: 'PNG',
  });
  const size = getNodeSize(node);
  const snapshot: FigmaVisualSnapshot = {
    protocolVersion: DESENGINE_PROTOCOL_VERSION,
    sessionToken: DESENGINE_DEV_SESSION_TOKEN,
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    width: size.width,
    height: size.height,
    exportedAt: new Date().toISOString(),
    image: {
      format: 'png',
      dataUrl: `data:image/png;base64,${bytesToBase64(bytes)}`,
      scale,
    },
  };

  console.log('[desengine:figma] visual snapshot prepared', {
    nodeId: snapshot.nodeId,
    nodeName: snapshot.nodeName,
    nodeType: snapshot.nodeType,
    width: snapshot.width,
    height: snapshot.height,
    dataUrlLength: snapshot.image.dataUrl.length,
  });

  return snapshot;
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
    console.log('[desengine:figma] sending selection ping', { endpointUrl: selectionEndpointUrl });

    const response = await fetch(selectionEndpointUrl, {
      body: JSON.stringify(readSelectionPing()),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const selectionStatus = (await response.json()) as ProtocolStatus;

    console.log('[desengine:figma] desktop response received', {
      httpOk: response.ok,
      status: selectionStatus,
    });

    const visualSnapshot = await readVisualSnapshot();
    console.log('[desengine:figma] sending visual snapshot', {
      endpointUrl: visualSnapshotEndpointUrl,
    });

    const visualResponse = await fetch(visualSnapshotEndpointUrl, {
      body: JSON.stringify(visualSnapshot),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const visualStatus = (await visualResponse.json()) as ProtocolStatus;

    console.log('[desengine:figma] visual snapshot response received', {
      httpOk: visualResponse.ok,
      status: visualStatus,
    });

    figma.ui.postMessage({
      type: 'desengine:send-result',
      ok: response.ok && selectionStatus.ok && visualResponse.ok && visualStatus.ok,
      message: visualStatus.message,
    });
  } catch (error) {
    console.error('[desengine:figma] handoff failed', error);

    figma.ui.postMessage({
      type: 'desengine:send-result',
      ok: false,
      message: 'Desktop-приложение desengine не отвечает на localhost:37645.',
    });
  }
};

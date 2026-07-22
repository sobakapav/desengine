import {
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_SELECTION_PING_ROUTE,
  DESENGINE_VISUAL_SNAPSHOT_ROUTE,
  createDevHandoffUrl,
  type FigmaSelectionPing,
  type ProtocolStatus,
} from '@desengine/protocol';

import { exportNodeAsPngVisualSnapshot } from './visual-snapshot';

declare const __html__: string;

const selectionEndpointUrl = createDevHandoffUrl(DESENGINE_SELECTION_PING_ROUTE);
const visualSnapshotEndpointUrl = createDevHandoffUrl(DESENGINE_VISUAL_SNAPSHOT_ROUTE);

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

async function readVisualSnapshot() {
  const node = figma.currentPage.selection[0];

  if (!node) {
    throw new Error('selection-empty');
  }

  console.log('[desengine:figma] selected node prepared for visual snapshot', {
    id: node.id,
    name: node.name,
    type: node.type,
  });

  return exportNodeAsPngVisualSnapshot(node);
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

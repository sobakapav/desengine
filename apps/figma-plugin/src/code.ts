import {
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_EXPLODED_FRAME_ROUTE,
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_SELECTION_PING_ROUTE,
  DESENGINE_VISUAL_SNAPSHOT_ROUTE,
  createDevHandoffUrl,
  type FigmaSelectionPing,
  type ProtocolStatus,
} from '@desengine/protocol';

import {
  canExportAutoLayoutFrame,
  exportAutoLayoutFrameAsExplodedSnapshot,
} from './exploded-frame';
import { exportNodeAsPngVisualSnapshot } from './visual-snapshot';

declare const __html__: string;

const selectionEndpointUrl = createDevHandoffUrl(DESENGINE_SELECTION_PING_ROUTE);
const visualSnapshotEndpointUrl = createDevHandoffUrl(DESENGINE_VISUAL_SNAPSHOT_ROUTE);
const explodedFrameEndpointUrl = createDevHandoffUrl(DESENGINE_EXPLODED_FRAME_ROUTE);

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
  const selectedNode = figma.currentPage.selection[0];
  const canCreateExplodedFrame = canExportAutoLayoutFrame(selectedNode);

  console.log('[desengine:figma] selection changed', {
    selectionCount: figma.currentPage.selection.length,
    firstNodeType: selectedNode?.type,
    canCreateExplodedFrame,
  });

  figma.ui.postMessage({
    type: 'desengine:selection-summary',
    selectionCount: figma.currentPage.selection.length,
    firstNodeName: selectedNode?.name,
    firstNodeType: selectedNode?.type,
    canCreateExplodedFrame,
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

  if (message?.type === 'desengine:create-exploded-frame') {
    try {
      const selectedNode = figma.currentPage.selection[0];

      if (!canExportAutoLayoutFrame(selectedNode)) {
        figma.ui.postMessage({
          type: 'desengine:send-result',
          ok: false,
          message: 'Выберите один auto-layout Frame для взрыв-схемы.',
        });
        return;
      }

      const explodedSnapshot = await exportAutoLayoutFrameAsExplodedSnapshot(selectedNode);
      console.log('[desengine:figma] sending exploded frame snapshot', {
        endpointUrl: explodedFrameEndpointUrl,
        frameId: explodedSnapshot.frame.nodeId,
        cellCount: explodedSnapshot.cellCount,
      });

      const explodedResponse = await fetch(explodedFrameEndpointUrl, {
        body: JSON.stringify(explodedSnapshot),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      });
      const explodedStatus = (await explodedResponse.json()) as ProtocolStatus;

      console.log('[desengine:figma] exploded frame response received', {
        httpOk: explodedResponse.ok,
        status: explodedStatus,
      });

      figma.ui.postMessage({
        type: 'desengine:send-result',
        ok: explodedResponse.ok && explodedStatus.ok,
        message: explodedStatus.message,
      });
    } catch (error) {
      console.error('[desengine:figma] exploded frame handoff failed', error);

      figma.ui.postMessage({
        type: 'desengine:send-result',
        ok: false,
        message: 'desengine не смог получить взрыв-схему с localhost:37645.',
      });
    }

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

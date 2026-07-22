import {
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_EXPLODED_FRAME_EXPORT_SCALE,
  DESENGINE_EXPLODED_FRAME_MAX_CELLS,
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_VISUAL_SNAPSHOT_FORMAT,
  type FigmaExplodedFrameCell,
  type FigmaExplodedFrameSnapshot,
} from '@desengine/protocol';

import { exportNodeAsPngVisualSnapshot } from './visual-snapshot';

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function isVisibleSceneNode(node: SceneNode) {
  return node.visible !== false;
}

function getRelativeNodeBox(node: SceneNode, frame: FrameNode) {
  const nodeBounds = 'absoluteBoundingBox' in node ? node.absoluteBoundingBox : undefined;
  const frameBounds = frame.absoluteBoundingBox;

  if (!nodeBounds || !frameBounds) {
    return {
      x: 0,
      y: 0,
      width: 'width' in node ? node.width : 0,
      height: 'height' in node ? node.height : 0,
    };
  }

  return {
    x: nodeBounds.x - frameBounds.x,
    y: nodeBounds.y - frameBounds.y,
    width: nodeBounds.width,
    height: nodeBounds.height,
  };
}

async function exportCell(node: SceneNode, frame: FrameNode, index: number) {
  if (!('exportAsync' in node)) {
    throw new Error('node-not-exportable');
  }

  const bytes = await node.exportAsync({
    constraint: {
      type: 'SCALE',
      value: DESENGINE_EXPLODED_FRAME_EXPORT_SCALE,
    },
    format: 'PNG',
  });
  const box = getRelativeNodeBox(node, frame);

  return {
    index,
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    image: {
      format: DESENGINE_VISUAL_SNAPSHOT_FORMAT,
      dataUrl: `data:image/png;base64,${bytesToBase64(bytes)}`,
      scale: DESENGINE_EXPLODED_FRAME_EXPORT_SCALE,
    },
  } satisfies FigmaExplodedFrameCell;
}

export function canExportAutoLayoutFrame(node: SceneNode | undefined): node is FrameNode {
  return Boolean(node && node.type === 'FRAME' && node.layoutMode !== 'NONE');
}

export async function exportAutoLayoutFrameAsExplodedSnapshot(
  frame: FrameNode,
): Promise<FigmaExplodedFrameSnapshot> {
  if (!canExportAutoLayoutFrame(frame)) {
    throw new Error('frame-not-auto-layout');
  }

  const children = frame.children
    .filter(isVisibleSceneNode)
    .slice(0, DESENGINE_EXPLODED_FRAME_MAX_CELLS);
  const layoutMode = frame.layoutMode === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';

  console.log('[desengine:figma] exporting auto-layout frame as exploded snapshot', {
    frameId: frame.id,
    frameName: frame.name,
    layoutMode,
    exportedChildren: children.length,
    totalChildren: frame.children.length,
  });

  const frameSnapshot = await exportNodeAsPngVisualSnapshot(frame, {
    scale: DESENGINE_EXPLODED_FRAME_EXPORT_SCALE,
  });
  const cells = await Promise.all(
    children.map((child, index) => exportCell(child, frame, index)),
  );

  const snapshot: FigmaExplodedFrameSnapshot = {
    protocolVersion: DESENGINE_PROTOCOL_VERSION,
    sessionToken: DESENGINE_DEV_SESSION_TOKEN,
    frame: frameSnapshot,
    layoutMode,
    cellCount: cells.length,
    cells,
    exportedAt: new Date().toISOString(),
  };

  console.log('[desengine:figma] exploded snapshot prepared', {
    frameId: snapshot.frame.nodeId,
    frameName: snapshot.frame.nodeName,
    cellCount: snapshot.cellCount,
  });

  return snapshot;
}

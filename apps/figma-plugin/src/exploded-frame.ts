import {
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_EXPLODED_FRAME_EXPORT_SCALE,
  DESENGINE_EXPLODED_FRAME_MAX_CELLS,
  DESENGINE_EXPLODED_FRAME_MAX_DEPTH,
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

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node;
}

function isAutoLayoutFrame(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME' && node.layoutMode !== 'NONE';
}

function getRelativeNodeBox(node: SceneNode, rootFrame: FrameNode) {
  const nodeBounds = 'absoluteBoundingBox' in node ? node.absoluteBoundingBox : undefined;
  const frameBounds = rootFrame.absoluteBoundingBox;

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

type ExplodedLeaf = {
  node: SceneNode;
  parentNodeId: string | null;
  depth: number;
  path: string[];
  stopReason: FigmaExplodedFrameCell['stopReason'];
};

function getStopReason(node: SceneNode, depth: number): FigmaExplodedFrameCell['stopReason'] | null {
  if (node.type === 'INSTANCE') {
    return 'instance';
  }

  if (node.type === 'FRAME' && node.layoutMode === 'NONE') {
    return 'non-auto-layout-frame';
  }

  if (depth >= DESENGINE_EXPLODED_FRAME_MAX_DEPTH) {
    return 'max-depth';
  }

  if (!isAutoLayoutFrame(node)) {
    return 'non-frame-node';
  }

  return null;
}

function collectExplodedLeaves(rootFrame: FrameNode) {
  const leaves: ExplodedLeaf[] = [];

  function visit(node: SceneNode, parentNodeId: string | null, depth: number, path: string[]) {
    if (leaves.length >= DESENGINE_EXPLODED_FRAME_MAX_CELLS || !isVisibleSceneNode(node)) {
      return;
    }

    const stopReason = getStopReason(node, depth);

    if (stopReason) {
      leaves.push({
        node,
        parentNodeId,
        depth,
        path,
        stopReason,
      });
      return;
    }

    if (!hasChildren(node)) {
      leaves.push({
        node,
        parentNodeId,
        depth,
        path,
        stopReason: 'non-frame-node',
      });
      return;
    }

    for (const child of node.children) {
      if (leaves.length >= DESENGINE_EXPLODED_FRAME_MAX_CELLS) {
        return;
      }

      visit(child, node.id, depth + 1, [...path, child.name]);
    }
  }

  for (const child of rootFrame.children) {
    if (leaves.length >= DESENGINE_EXPLODED_FRAME_MAX_CELLS) {
      break;
    }

    visit(child, rootFrame.id, 1, [rootFrame.name, child.name]);
  }

  return leaves;
}

async function exportCell(leaf: ExplodedLeaf, rootFrame: FrameNode, index: number) {
  const { node } = leaf;

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
  const box = getRelativeNodeBox(node, rootFrame);

  return {
    index,
    nodeId: node.id,
    parentNodeId: leaf.parentNodeId,
    nodeName: node.name,
    nodeType: node.type,
    depth: leaf.depth,
    path: leaf.path,
    stopReason: leaf.stopReason,
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
  return Boolean(node && isAutoLayoutFrame(node));
}

export async function exportAutoLayoutFrameAsExplodedSnapshot(
  frame: FrameNode,
): Promise<FigmaExplodedFrameSnapshot> {
  if (!canExportAutoLayoutFrame(frame)) {
    throw new Error('frame-not-auto-layout');
  }

  const leaves = collectExplodedLeaves(frame);
  const layoutMode = frame.layoutMode === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';

  console.log('[desengine:figma] exporting auto-layout frame as exploded snapshot', {
    frameId: frame.id,
    frameName: frame.name,
    layoutMode,
    exportedLeaves: leaves.length,
    totalChildren: frame.children.length,
    maxDepth: DESENGINE_EXPLODED_FRAME_MAX_DEPTH,
    maxCells: DESENGINE_EXPLODED_FRAME_MAX_CELLS,
  });

  const frameSnapshot = await exportNodeAsPngVisualSnapshot(frame, {
    scale: DESENGINE_EXPLODED_FRAME_EXPORT_SCALE,
  });
  const cells = await Promise.all(
    leaves.map((leaf, index) => exportCell(leaf, frame, index)),
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

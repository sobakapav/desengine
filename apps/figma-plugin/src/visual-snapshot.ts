import {
  DESENGINE_DEV_SESSION_TOKEN,
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_VISUAL_SNAPSHOT_EXPORT_SCALE,
  DESENGINE_VISUAL_SNAPSHOT_FORMAT,
  type FigmaVisualSnapshot,
} from '@desengine/protocol';

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

export async function exportNodeAsPngVisualSnapshot(
  node: SceneNode,
  options: { scale?: number } = {},
): Promise<FigmaVisualSnapshot> {
  if (!('exportAsync' in node)) {
    throw new Error('node-not-exportable');
  }

  const scale = options.scale ?? DESENGINE_VISUAL_SNAPSHOT_EXPORT_SCALE;
  console.log('[desengine:figma] exporting node as PNG visual snapshot', {
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
      format: DESENGINE_VISUAL_SNAPSHOT_FORMAT,
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

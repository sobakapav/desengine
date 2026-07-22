import { z } from 'zod';
export const DESENGINE_PROTOCOL_VERSION = '0.0.1';
export const DESENGINE_MAX_MESSAGE_BYTES = 80_000_000;
export const DESENGINE_DEV_HANDOFF_PORT = 37645;
export const DESENGINE_DEV_SESSION_TOKEN = 'desengine-dev-session';
export const DESENGINE_HEALTH_ROUTE = '/health';
export const DESENGINE_SELECTION_PING_ROUTE = '/figma/selection';
export const DESENGINE_SELECTION_PING_LATEST_ROUTE = '/figma/selection/latest';
export const DESENGINE_VISUAL_SNAPSHOT_ROUTE = '/figma/visual-snapshot';
export const DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE = '/figma/visual-snapshot/latest';
export const DESENGINE_EXPLODED_FRAME_ROUTE = '/figma/exploded-frame';
export const DESENGINE_EXPLODED_FRAME_LATEST_ROUTE = '/figma/exploded-frame/latest';
export const DESENGINE_VISUAL_SNAPSHOT_FORMAT = 'png';
export const DESENGINE_VISUAL_SNAPSHOT_EXPORT_SCALE = 2;
export const DESENGINE_EXPLODED_FRAME_MAX_CELLS = 100;
export const DESENGINE_EXPLODED_FRAME_MAX_DEPTH = 4;
export const DESENGINE_EXPLODED_FRAME_EXPORT_SCALE = 1;
export function createDevHandoffUrl(route, host = 'localhost') {
    return `http://${host}:${DESENGINE_DEV_HANDOFF_PORT}${route}`;
}
export const protocolVersionSchema = z.literal(DESENGINE_PROTOCOL_VERSION);
export const protocolStatusSchema = z.object({
    protocolVersion: protocolVersionSchema,
    ok: z.boolean(),
    code: z.enum([
        'accepted',
        'invalid-protocol-version',
        'invalid-session',
        'invalid-payload',
        'payload-too-large',
        'desktop-unavailable',
    ]),
    message: z.string().min(1),
});
export const figmaSelectionPingSchema = z.object({
    protocolVersion: protocolVersionSchema,
    sessionToken: z.literal(DESENGINE_DEV_SESSION_TOKEN),
    selectionCount: z.number().int().min(0).max(100),
    selectedNodeNames: z.array(z.string().min(1).max(200)).max(100),
    sentAt: z.string().datetime(),
});
export const figmaVisualSnapshotSchema = z.object({
    protocolVersion: protocolVersionSchema,
    sessionToken: z.literal(DESENGINE_DEV_SESSION_TOKEN),
    nodeId: z.string().min(1).max(200),
    nodeName: z.string().min(1).max(200),
    nodeType: z.string().min(1).max(100),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    exportedAt: z.string().datetime(),
    image: z.object({
        format: z.literal(DESENGINE_VISUAL_SNAPSHOT_FORMAT),
        dataUrl: z.string().startsWith('data:image/png;base64,'),
        scale: z.number().positive(),
    }),
});
export const figmaExplodedFrameCellSchema = z.object({
    index: z.number().int().min(0).max(DESENGINE_EXPLODED_FRAME_MAX_CELLS - 1),
    nodeId: z.string().min(1).max(200),
    parentNodeId: z.string().min(1).max(200).nullable(),
    nodeName: z.string().min(1).max(200),
    nodeType: z.string().min(1).max(100),
    depth: z.number().int().min(1).max(DESENGINE_EXPLODED_FRAME_MAX_DEPTH),
    path: z.array(z.string().min(1).max(200)).min(1).max(DESENGINE_EXPLODED_FRAME_MAX_DEPTH + 1),
    stopReason: z.enum([
        'instance',
        'non-auto-layout-frame',
        'max-depth',
        'non-frame-node',
    ]),
    x: z.number(),
    y: z.number(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    image: z.object({
        format: z.literal(DESENGINE_VISUAL_SNAPSHOT_FORMAT),
        dataUrl: z.string().startsWith('data:image/png;base64,'),
        scale: z.number().positive(),
    }),
});
export const figmaExplodedFrameSnapshotSchema = z.object({
    protocolVersion: protocolVersionSchema,
    sessionToken: z.literal(DESENGINE_DEV_SESSION_TOKEN),
    frame: figmaVisualSnapshotSchema,
    layoutMode: z.enum(['HORIZONTAL', 'VERTICAL']),
    cellCount: z.number().int().min(0).max(DESENGINE_EXPLODED_FRAME_MAX_CELLS),
    cells: z.array(figmaExplodedFrameCellSchema).max(DESENGINE_EXPLODED_FRAME_MAX_CELLS),
    exportedAt: z.string().datetime(),
});

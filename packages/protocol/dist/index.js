import { z } from 'zod';
export const DESENGINE_PROTOCOL_VERSION = '0.0.1';
export const DESENGINE_MAX_MESSAGE_BYTES = 8_000_000;
export const DESENGINE_DEV_HANDOFF_PORT = 37645;
export const DESENGINE_DEV_SESSION_TOKEN = 'desengine-dev-session';
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
        format: z.literal('png'),
        dataUrl: z.string().startsWith('data:image/png;base64,'),
        scale: z.number().positive(),
    }),
});

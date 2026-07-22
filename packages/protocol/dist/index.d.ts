import { z } from 'zod';
export declare const DESENGINE_PROTOCOL_VERSION = "0.0.1";
export declare const DESENGINE_MAX_MESSAGE_BYTES = 8000000;
export declare const DESENGINE_DEV_HANDOFF_PORT = 37645;
export declare const DESENGINE_DEV_SESSION_TOKEN = "desengine-dev-session";
export declare const protocolVersionSchema: z.ZodLiteral<"0.0.1">;
export declare const protocolStatusSchema: z.ZodObject<{
    protocolVersion: z.ZodLiteral<"0.0.1">;
    ok: z.ZodBoolean;
    code: z.ZodEnum<{
        accepted: "accepted";
        "invalid-protocol-version": "invalid-protocol-version";
        "invalid-session": "invalid-session";
        "invalid-payload": "invalid-payload";
        "payload-too-large": "payload-too-large";
        "desktop-unavailable": "desktop-unavailable";
    }>;
    message: z.ZodString;
}, z.core.$strip>;
export type ProtocolStatus = z.infer<typeof protocolStatusSchema>;
export declare const figmaSelectionPingSchema: z.ZodObject<{
    protocolVersion: z.ZodLiteral<"0.0.1">;
    sessionToken: z.ZodLiteral<"desengine-dev-session">;
    selectionCount: z.ZodNumber;
    selectedNodeNames: z.ZodArray<z.ZodString>;
    sentAt: z.ZodString;
}, z.core.$strip>;
export type FigmaSelectionPing = z.infer<typeof figmaSelectionPingSchema>;
export declare const figmaVisualSnapshotSchema: z.ZodObject<{
    protocolVersion: z.ZodLiteral<"0.0.1">;
    sessionToken: z.ZodLiteral<"desengine-dev-session">;
    nodeId: z.ZodString;
    nodeName: z.ZodString;
    nodeType: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    exportedAt: z.ZodString;
    image: z.ZodObject<{
        format: z.ZodLiteral<"png">;
        dataUrl: z.ZodString;
        scale: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type FigmaVisualSnapshot = z.infer<typeof figmaVisualSnapshotSchema>;

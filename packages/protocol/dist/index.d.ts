import { z } from 'zod';
export declare const DESENGINE_PROTOCOL_VERSION = "0.0.1";
export declare const DESENGINE_MAX_MESSAGE_BYTES = 8000000;
export declare const DESENGINE_DEV_HANDOFF_PORT = 37645;
export declare const DESENGINE_DEV_SESSION_TOKEN = "desengine-dev-session";
export declare const DESENGINE_HEALTH_ROUTE = "/health";
export declare const DESENGINE_SELECTION_PING_ROUTE = "/figma/selection";
export declare const DESENGINE_SELECTION_PING_LATEST_ROUTE = "/figma/selection/latest";
export declare const DESENGINE_VISUAL_SNAPSHOT_ROUTE = "/figma/visual-snapshot";
export declare const DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE = "/figma/visual-snapshot/latest";
export declare const DESENGINE_EXPLODED_FRAME_ROUTE = "/figma/exploded-frame";
export declare const DESENGINE_EXPLODED_FRAME_LATEST_ROUTE = "/figma/exploded-frame/latest";
export declare const DESENGINE_VISUAL_SNAPSHOT_FORMAT = "png";
export declare const DESENGINE_VISUAL_SNAPSHOT_EXPORT_SCALE = 2;
export declare const DESENGINE_EXPLODED_FRAME_MAX_CELLS = 12;
export declare const DESENGINE_EXPLODED_FRAME_EXPORT_SCALE = 1;
export declare function createDevHandoffUrl(route: string, host?: string): string;
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
export declare const figmaExplodedFrameCellSchema: z.ZodObject<{
    index: z.ZodNumber;
    nodeId: z.ZodString;
    nodeName: z.ZodString;
    nodeType: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    image: z.ZodObject<{
        format: z.ZodLiteral<"png">;
        dataUrl: z.ZodString;
        scale: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type FigmaExplodedFrameCell = z.infer<typeof figmaExplodedFrameCellSchema>;
export declare const figmaExplodedFrameSnapshotSchema: z.ZodObject<{
    protocolVersion: z.ZodLiteral<"0.0.1">;
    sessionToken: z.ZodLiteral<"desengine-dev-session">;
    frame: z.ZodObject<{
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
    layoutMode: z.ZodEnum<{
        HORIZONTAL: "HORIZONTAL";
        VERTICAL: "VERTICAL";
    }>;
    cellCount: z.ZodNumber;
    cells: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        nodeId: z.ZodString;
        nodeName: z.ZodString;
        nodeType: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        image: z.ZodObject<{
            format: z.ZodLiteral<"png">;
            dataUrl: z.ZodString;
            scale: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    exportedAt: z.ZodString;
}, z.core.$strip>;
export type FigmaExplodedFrameSnapshot = z.infer<typeof figmaExplodedFrameSnapshotSchema>;

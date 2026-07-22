import { z } from 'zod';
export declare const DESENGINE_PROTOCOL_VERSION = "0.0.1";
export declare const DESENGINE_MAX_MESSAGE_BYTES = 2000000;
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

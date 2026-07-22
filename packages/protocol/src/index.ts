import { z } from 'zod';

export const DESENGINE_PROTOCOL_VERSION = '0.0.1';
export const DESENGINE_MAX_MESSAGE_BYTES = 2_000_000;

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

export type ProtocolStatus = z.infer<typeof protocolStatusSchema>;

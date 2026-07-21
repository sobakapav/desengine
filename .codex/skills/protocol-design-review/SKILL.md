---
name: protocol-design-review
description: Use when designing or reviewing shared protocol messages between Figma plugin, Electron app, local endpoint, renderer, preload, main process, and behavior model packages.
---

# Protocol Design Review

Protocol changes must be:

- versioned;
- typed;
- schema-validated at trust boundaries;
- backward-compatible or explicitly migrated;
- free of executable code payloads;
- explicit about source app, source version, and protocol version.

For every protocol message, check:

- sender;
- receiver;
- transport;
- trust level;
- schema;
- max size;
- failure response;
- migration behavior.

Prefer a shared package for protocol types and schemas.

---
name: figma-plugin-flow-review
description: Use when designing, reviewing, or implementing the desengine Figma plugin flow, including selection capture, manifest network access, plugin UI, local endpoint transport, and Figma-to-desktop handoff.
---

# Figma Plugin Flow Review

Use this workflow:

1. Identify the user action in Figma.
2. Define what selection/node data the plugin reads.
3. Keep plugin output as JSON snapshot, not executable code.
4. Check `manifest.json` network access and development domains.
5. Route launch/pairing through `desengine://`.
6. Route payload transfer through the local endpoint.
7. Validate protocol version, session token, payload size, and schema.
8. Provide a fallback when desktop app is missing or unreachable.

Prefer Figma Desktop App as the first supported surface unless the user explicitly expands scope to Figma web.

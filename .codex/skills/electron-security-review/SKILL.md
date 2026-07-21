---
name: electron-security-review
description: Use when reviewing or designing Electron main/preload/renderer boundaries, IPC, local endpoints, protocol handlers, file access, or desktop security decisions in desengine.
---

# Electron Security Review

Review Electron changes with these checks:

- Renderer must not receive Node, `fs`, `shell`, `process`, or unrestricted Electron APIs.
- `nodeIntegration` stays off and `contextIsolation` stays on unless an explicit architecture decision says otherwise.
- Preload exposes a small typed API only.
- IPC handlers validate arguments and return typed results.
- Main process treats renderer, Figma payloads, imported assets, and local endpoint requests as untrusted.
- `desengine://` handlers parse and validate URL parameters before action.
- Local endpoints bind to loopback and require pairing/session tokens.
- File writes go through explicit user/project boundaries.

Output should lead with security risks, then recommended fixes.

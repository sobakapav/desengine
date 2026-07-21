---
name: ui-player-design-review
description: Use when designing or reviewing the behavior player UI, timeline, playback controls, scenario branches, graph/map mode, React Flow usage, ELK layout, and designer-facing interaction model.
---

# UI Player Design Review

Review through the designer-facing product lens:

- The primary experience should show behavior in motion.
- Timeline, play/pause, scrub, step, reset, and branch choice must be visible and direct.
- Text-heavy state-machine UI is secondary.
- Graph/map mode helps coverage and navigation but should not hijack the main player.
- Use @xyflow/react for interactive graph views and elkjs for layout when graph complexity requires it.
- Do not add D3.js unless the task needs custom data visualization beyond React Flow/SVG/CSS.
- Keep controls compact, predictable, and icon-led with labels/tooltips where needed.

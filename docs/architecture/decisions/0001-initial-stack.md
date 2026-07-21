# ADR 0001: стартовый стек desktop + Figma plugin

## Status

Accepted

## Context

Продукт после pivot строится вокруг desktop-инструмента для проигрывания и проработки поведения Figma-компонентов. Пользователю важна прозрачная установка и запуск без локального dev-server как пользовательской модели.

## Decision

Берём стартовый стек:

- Electron Forge;
- Webpack;
- TypeScript;
- React;
- Tailwind CSS;
- shadcn/ui;
- lucide-icons;
- Zustand;
- Motion;
- @xyflow/react;
- elkjs;
- Figma plugin;
- shared protocol package;
- `desengine://` + local endpoint.

## Consequences

- Desktop app становится основным продуктовым контейнером.
- Figma plugin становится отдельным приложением, но использует общий protocol package.
- Webpack выбран как более консервативная альтернатива Vite.
- React Flow и ELK входят в стек для схем поведения, но не диктуют главный workflow.
- D3.js не добавляется до появления конкретной задачи, где он объективно нужен.

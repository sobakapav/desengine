## Why

Архитектура desengine должна максимально опираться на готовые сильные компоненты и библиотеки там, где это снижает риск, ускоряет поставку и улучшает UX. В проекте уже есть удачные примеры: Sandpack для browser preview/runtime, Konva/react-konva для canvas-инспектора, Monaco для редактора, shadcn/Radix для базового UI, Mermaid для диаграмм, Storybook/Playwright/Vitest для тестового слоя.

Без явной стратегии команда рискует либо переписывать готовые зрелые решения вручную, либо бесконтрольно тащить зависимости, которые потом станут архитектурным долгом.

## What Changes

- Вводится capability `component-sourcing`: политика выбора готовых компонентов, библиотек и platform primitives.
- Фиксируется правило: default-путь — искать зрелый готовый компонент/primitive, но принимать его только через adapter boundary и критерии пригодности.
- Составляется inventory текущих primitives:
  - Sandpack — preview/runtime;
  - Konva/react-konva — интерактивный canvas/image tooling;
  - Monaco — code editor;
  - shadcn/Radix — system UI primitives;
  - Mermaid — diagrams;
  - Storybook/Playwright/Vitest — UI/test harness;
  - Recharts — charts;
  - react-resizable-panels — layout panels.
- Workbench Platform Registry обязан использовать эту стратегию при выборе tool primitives.
- Новые tools/workbenches должны начинаться с sourcing decision: reuse/adapt/build.

## Non-goals

- Не добавляем новые runtime dependencies в этом change.
- Не заменяем уже работающие компоненты только ради унификации.
- Не превращаем правило reuse в догму: если готовый компонент ломает UX, приватность, performance или ownership, допустим свой слой.
- Не меняем install-critical стек.

## Capabilities

### New Capabilities

- `component-sourcing`: выбор, адаптация и governance готовых компонентов.

### Modified Capabilities

- `workbench`: Workbench tools выбирают primitives через component-sourcing decision.
- `testing-layer`: sourcing decision фиксирует уровень проверки для выбранной библиотеки.

## Acceptance Criteria

- Есть inventory текущих готовых primitives и их роль в архитектуре.
- Есть критерии выбора `reuse / adapt / build`.
- Для каждого нового workbench/tool/runtime primitive требуется sourcing decision.
- Готовая библиотека подключается через adapter/facade boundary, если её API может протечь в домен.
- Добавление зависимости требует тестового следа и OpenSpec rationale.

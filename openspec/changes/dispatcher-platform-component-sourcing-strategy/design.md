## Context

Локальный анализ кода показывает, что проект уже использует зрелые компоненты там, где это оправдано:

- `@codesandbox/sandpack-react` — browser preview/runtime через `SandpackProvider` и `SandpackPreview`.
- `konva` + `react-konva` — canvas-layer image inspector.
- `@monaco-editor/react` + `monaco-editor` — code editing.
- `components/ui/**` поверх Radix/shadcn — базовые controls и shell primitives.
- `mermaid` — диаграммы в help/playground.
- `recharts` — chart primitives.
- `react-resizable-panels` — resizable layout primitives.
- Storybook/Vitest/Playwright — component/e2e/test harness.

Внешняя проверка по официальным источникам подтверждает выбранный класс решений:

- Sandpack: https://sandpack.codesandbox.io/ — live coding environment, browser preview/runtime и low-code tools.
- Konva: https://konvajs.org/docs/index.html — interactive 2D canvas graphics с React binding `react-konva`.
- Monaco: https://github.com/microsoft/monaco-editor — browser-based code editor из VS Code family.
- Radix Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction — low-level accessible UI primitives.
- shadcn/ui: https://ui.shadcn.com/docs — open-code component distribution поверх доступных UI primitives.
- Storybook: https://storybook.js.org/docs/writing-tests — component stories как тестовые cases и browser component tests.
- Recharts: https://recharts.github.io/en-US/ — composable React charting.
- Mermaid: https://mermaid.ai/open-source/intro/index.html — text/code-based diagrams для документации.
- react-resizable-panels: https://github.com/bvaughn/react-resizable-panels — React resizable panel layouts.

## Decision Framework

Для каждого нового platform primitive команда выбирает один из вариантов:

### Reuse

Используем готовую библиотеку почти напрямую, если:

- задача совпадает с core capability библиотеки;
- библиотека зрелая и поддерживаемая;
- есть React/Next-compatible integration path;
- UX выигрывает от готовой функциональности;
- dependency не требует смены install-critical стека.

Примеры: Sandpack для preview, Konva для canvas, Monaco для editor.

### Adapt

Используем библиотеку через adapter/facade, если:

- API библиотеки может протечь в доменную модель;
- нужно сохранить возможность заменить primitive позже;
- нужны project/workbench/artifact bindings поверх готового runtime.

Примеры: Sandpack payload builder, WorkbenchTool adapter для Konva tools, UI kit adapter.

### Build

Пишем своё, если:

- готовая библиотека слишком тяжёлая для задачи;
- она ломает privacy/local-first требования;
- она требует нежелательной смены стека;
- задача является доменным ядром desengine, а не generic UI/runtime primitive.

Примеры: Project/Task/Workflow/Artifact/Event contracts, PromptContext, storage boundaries.

## Inventory Rules

Каждый выбранный primitive должен иметь:

- роль в архитектуре;
- owner boundary;
- adapter/facade, если API не должен протекать;
- test level;
- fallback/degradation strategy;
- OpenSpec rationale.

## Placement In Roadmap

Этот change должен идти после `implement-task-workflow-artifact-contract` и до `implement-workbench-platform-registry`.

Причина: Workbench Registry будет выбирать tools/primitives, и ему нужна политика sourcing до того, как image/layout/tools начнут размножаться.

## Initial Candidate Matrix

| Зона | Default primitive | Strategy |
| --- | --- | --- |
| Browser code preview | Sandpack | Adapt |
| Code editor | Monaco | Adapt |
| Canvas/image tools | Konva/react-konva | Adapt |
| System controls | shadcn/Radix | Reuse/Adapt |
| Diagrams/docs | Mermaid | Reuse |
| Charts/metrics | Recharts | Reuse/Adapt |
| Resizable workbench layout | react-resizable-panels | Reuse/Adapt |
| Component workshop/testing | Storybook + Vitest/Playwright | Reuse |
| Domain model | Project/Task/Workflow/Artifact/Event | Build |
| Storage ownership | Storage adapters | Build |

## Candidate Watchlist

Эти primitives не добавляются в стек этим change. Они входят в список "рассмотреть при первом реальном use case" и требуют отдельного sourcing decision перед установкой:

| Зона | Candidate primitive | When to consider | Default stance |
| --- | --- | --- | --- |
| Workflow graph / node-based UI | React Flow / xyflow | Когда появится настоящий graph workbench для task/workflow/artifact связей | Adapt |
| Сложные таблицы и data grids | TanStack Table | Когда project/task/artifact/cost/action-log списки перерастут простые таблицы | Adapt |
| Drag/drop interactions | dnd-kit | Когда Workbench потребует reorder, drag tools или layout interactions | Adapt |
| Rich document editing | Tiptap | Только если Markdown/Monaco перестанут покрывать prompt/task/document editing | Adapt/Build decision |

Правило для watchlist: кандидат не становится зависимостью заранее. Он только задаёт направление поиска, чтобы команда не писала вручную зрелый generic primitive, но и не расширяла стек "на всякий случай".

## Testing Strategy

- Static/contract: every new tool/workbench change contains sourcing decision.
- Unit: adapters preserve project/task/artifact/workbench boundaries.
- Component/browser: primitives that affect UX have smoke tests.
- Traceability: sourcing decisions reference affected capability/scenarios.

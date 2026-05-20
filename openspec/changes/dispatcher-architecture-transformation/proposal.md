## Why

После `research-architecture-capital-analysis-2026-05-19`, `implement-lab-runtime-contract-hardening` и `dispatcher-ui-kit` система получила первые реальные архитектурные границы, но следующие активные changes всё ещё выглядят как набор параллельных продуктовых направлений.

Нужен отдельный change-диспетчер, который:

- фиксирует последовательность трансформационных changes;
- объясняет, почему они идут именно в таком порядке;
- отделяет архитектурные prerequisites от будущих пользовательских фич;
- включает `code-readability-practices-2026-05-19` в общую governance-орбиту без продолжения активной работы по нему сейчас.

## What Changes

- Вводится roadmap внедрения новой архитектуры через последовательность changes:
  1. `implement-project-workspace-storage-boundary`
  2. `implement-task-workflow-artifact-contract`
  3. `dispatcher-platform-component-sourcing-strategy`
  4. `implement-workbench-platform-registry`
  5. `implement-prompt-context-runtime-boundary`
  6. `idea-event-envelope-experience-cost-boundary`
  7. `dispatcher-packaging-readiness-storage-adapters`
- Фиксируется роль уже стабилизированных релизных срезов:
  - `implement-lab-runtime-contract-hardening` — выполненный фундамент service/mutation boundary;
  - `dispatcher-ui-kit` — релизный срез с seed `Project` для Sandpack preview и дальнейшим UI kit-направлением;
  - `code-readability-practices-2026-05-19` — governance baseline для читаемости и ревью, без новых активных действий в этом проходе.
- Существующие продуктовые changes (`dev-mode-project-work`, `task-and-workflow-entities-research`, `workbench-entity-workflow-step`, `user-experience-generalization`, `cost-accounting-layer`, packaging changes) становятся входными материалами и downstream-эпиками, а не конкурирующими первыми шагами.

## Non-goals

- Не реализуем новую пользовательскую функциональность в dispatcher.
- Не меняем стек, storage backend, Next.js, Turbopack, Node.js или Sandpack.
- Не архивируем автоматически существующие changes.
- Не запускаем UI kit wave до стабилизации Project/Workbench/Artifact contracts.
- Не добавляем новые platform primitives без sourcing decision: `reuse`, `adapt` или `build`.

## Capabilities

### New Capabilities

- `architecture-roadmap`: управление порядком архитектурных transformation changes.

### Modified Capabilities

- `testing-layer`: каждый transformation change обязан иметь понятную тестовую часть и команды проверки.
- `code-readability`: принимается как governance baseline для будущих changes.
- `component-sourcing`: готовые компоненты и библиотеки выбираются через явный architecture decision.

## Acceptance Criteria

- Есть явная последовательность transformation changes к исполнению.
- Для каждого шага указаны цель, зависимости, non-goals, acceptance criteria и тестовый уровень.
- Dispatcher объясняет, почему порядок уменьшает архитектурный риск и защищает текущий lab UX.
- `code-readability-practices-2026-05-19` включён в roadmap как baseline, но не превращается в блокер runtime changes.
- `npm run openspec` и `npm run test:traceability` проходят.

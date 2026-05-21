## Why

После `research-architecture-capital-analysis-2026-05-19`, `implement-lab-runtime-contract-hardening` и `dispatcher-ui-kit` система получила первые реальные архитектурные границы, но следующие активные changes всё ещё выглядят как набор параллельных продуктовых направлений.

Нужен отдельный producer-change, который:

- фиксирует последовательность трансформационных changes и их статус;
- объясняет, почему они идут именно в таком порядке;
- отделяет архитектурные prerequisites от будущих пользовательских фич;
- отличает завершённые foundation-steps от активной очереди и follow-up cleanup;
- включает `code-readability-practices-2026-05-19` в общую governance-орбиту без продолжения активной работы по нему сейчас.

## What Changes

- Вводится status-aware roadmap внедрения новой архитектуры:
  - завершённые foundation steps, архивированные 2026-05-20:
    1. `implement-project-workspace-storage-boundary`
    2. `implement-task-workflow-artifact-contract`
    3. `implement-workbench-platform-registry`
    4. `implement-prompt-context-runtime-boundary`
  - активная очередь capability changes:
    1. `producer-platform-component-sourcing-strategy`
    2. `producer-event-envelope-experience-cost-boundary`
    3. `dispatcher-packaging-readiness-storage-adapters`
  - отдельная cleanup lane для архитектурных readability follow-up:
    - `architecture-followup-route-services`
    - `architecture-followup-workbench-controller-split`
    - `architecture-followup-sandpack-facade-split`
- Фиксируется роль уже стабилизированных релизных срезов:
  - `implement-lab-runtime-contract-hardening` — выполненный и архивированный 2026-05-21 фундамент service/mutation boundary; tactical ownership закрытия передан в `dispatcher-runtime`;
  - `dispatcher-ui-kit` — релизный срез с seed `Project` для Sandpack preview и дальнейшим UI kit-направлением;
  - `code-readability-practices-2026-05-19` — governance baseline для читаемости и ревью, без новых активных действий в этом проходе.
- Существующие продуктовые changes (`dev-mode-project-work`, `producer-task-and-workflow-entities`, `workbench-entity-workflow-step`, `user-experience-generalization`, `cost-accounting-layer`, packaging changes) становятся входными материалами и downstream-эпиками, а не конкурирующими первыми шагами.
- Tactical delivery для этой волны распределяется по dispatcher changes предметных линий; для lab runtime foundation вводится отдельный `dispatcher-runtime`.

## Non-goals

- Не реализуем новую пользовательскую функциональность в producer.
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
- Roadmap различает `done`, `active`, `planned` и `cleanup` шаги.
- Для каждого шага указаны цель, зависимости, non-goals, acceptance criteria и тестовый уровень.
- Producer объясняет, почему порядок уменьшает архитектурный риск и защищает текущий lab UX.
- Readability follow-up cleanup привязан к roadmap, но не подменяет capability-очередь.
- `code-readability-practices-2026-05-19` включён в roadmap как baseline, но не превращается в блокер runtime changes.
- `npm run test:traceability` и `git diff --check` проходят.

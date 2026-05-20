## Why

`dispatcher-project-ui-kit-switching` уже ввёл минимальный `Project` для lab-preview, но это пока локальный scope Workbench/Sandpack. Если сразу развивать `dev-mode-project-work`, Figma import, roadmap, cost или packaging, система рискует получить несколько несовместимых Project shapes и storage-подходов.

Этот change поднимает `Project` из preview-настройки в настоящий `Project Workspace` и вводит storage boundary, не меняя стек и не ломая текущий lab UX.

## What Changes

- Вводится canonical `Project Workspace` contract.
- Настройки, уже появившиеся в preview (`uiKitId`, `uiMode`), становятся частью project settings.
- Появляется project registry и active project context.
- Вводится storage adapter boundary для project-scoped данных.
- Определяется миграция/совместимость с текущим localStorage Project MVP.
- `research-dev-mode-project-work` становится downstream feature над этой границей, а не вторым вводом Project.

## Non-goals

- Не реализуем cloud/electron storage.
- Не вводим multi-user projects, roles или collaboration.
- Не переносим все task/user данные в project scope за один раз.
- Не меняем текущий lab URL и базовый UX.

## Capabilities

### New Capabilities

- `projects`: project workspace, registry и active project context.
- `storage-adapter`: контракт доступа к project-scoped данным.

### Modified Capabilities

- `level-labs`: lab получает project context из workspace boundary.
- `task`: task runtime готовится к project-scoped данным.

## Acceptance Criteria

- В коде есть один canonical `Project`/`ProjectWorkspace` shape.
- `uiKitId` и `uiMode` не живут только в Workbench-local state; у них есть project settings boundary.
- Есть storage adapter interface для project config и project-scoped runtime данных.
- Текущий lab продолжает открываться и работать без капитального UX изменения.
- Есть план миграции localStorage preview settings в Project Workspace MVP.
- `npm run test:unit`, `npm run test:traceability` проходят; при browser-flow добавляется smoke без live credentials.

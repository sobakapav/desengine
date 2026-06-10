## Tasks

- [x] 1. Зафиксировать canonical `ProjectWorkspace`, `ProjectSettings` и project registry в OpenSpec-контракте.
- [x] 2. Описать минимальный create/select flow проекта:
  - [x] 2.1 новый проект создаётся с именем;
  - [x] 2.2 новый проект создаётся с базовым `UI kit`;
  - [x] 2.3 active project определяется через project registry, а не через ad-hoc lab state.
- [x] 3. Ввести project storage adapter boundary без смены storage backend.
- [x] 4. Привязать лабораторию к active project context и убрать конкурирующий local project shape.
- [x] 5. Обновить OpenSpec specs для `projects`, `storage-adapter`, `level-labs` и при необходимости `task`.
- [x] 6. Подготовить тестовую и traceability-рамку реализации.
- [x] 7. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: canonical project workspace, registry, active project, project settings.
- `storage-adapter`: project-scoped данные читаются и пишутся через boundary.
- `level-labs`: лаборатория использует active project context вместо ad-hoc local shape.
- `task`: task runtime получает project settings из canonical boundary.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для normalization/serialization project workspace и storage adapter boundary.
- component/browser: обязателен, если реализация меняет create/select UX проекта или вход в лабораторию.
- integration: обязателен, если active project context проходит через route/runtime boundary.
- e2e smoke: по необходимости, если change меняет сквозной flow выбора проекта и входа в lab.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `npm run test:integration`
- browser/e2e-команда для create/select flow отложена и зафиксирована в `test/traceability/coverage-plan.json` (`projects` -> `project-workspace-browser-flow`)

Mock/fixture-данные и credentials:
- fixture-данные должны включать хотя бы один persisted `ProjectWorkspace`, project registry с active project и сценарий создания проекта с именем и `uiKitId`;
- live credentials не нужны.

## Tasks

- [x] 1. Зафиксировать project config contract на пользовательском уровне.
- [x] 2. Реализовать project config surface:
  - [x] 2.1 показать JSON-конфиг проекта на project page;
  - [x] 2.2 дать редактирование canonical project settings;
  - [x] 2.3 показать и переключать `uiKitId` через canonical список.
- [x] 3. Проявить project `uiKit` в user-facing contract:
  - [x] 3.1 на странице проекта показать selected/effective kit и migration status;
  - [x] 3.2 зафиксировать, что prompt templates и preview используют project-level kit contract.
- [x] 4. Обновить OpenSpec delta для capability `projects` и `task`.
- [x] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь читает и редактирует project config.
- `projects`: пользователь выбирает `uiKitId` из canonical списка на уровне проекта.
- `task`: prompt/render context продолжает читать project-level UI kit contract.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для project config adapters, JSON validation и prompt/render contract.
- component/browser: обязателен, если реализация меняет интерактивный JSON/config editor.
- integration: не обязателен, если конфигурация остаётся в текущем browser storage boundary.
- e2e smoke: по необходимости, если появится отдельный project-config flow.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <project-config-and-prompt-contract-tests>`
- browser/runtime-команда уточняется в ходе реализации, если change затронет интерактивный JSON editor

Mock/fixture-данные и credentials:
- fixtures должны включать проекты с разными `uiKitId`, `uiMode` и migration status;
- live credentials не нужны.

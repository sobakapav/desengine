## Tasks

- [ ] 1. Зафиксировать project-aware contract для onboarding/task layer.
- [ ] 2. Привязать task/opening flow к active project context:
  - [ ] 2.1 task projection знает `projectId`;
  - [ ] 2.2 active project участвует в task/opening runtime;
  - [ ] 2.3 onboarding/task layer не работает как project-less глобальный поток.
- [ ] 3. Обновить OpenSpec specs для `task` и при необходимости `projects`.
- [ ] 4. Зафиксировать тестовую и traceability-рамку project-aware task-layer binding.
- [ ] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: active project участвует в task/opening layer.
- `task`: task runtime и task projection работают внутри project context.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для task projection и project-aware runtime models.
- component/browser: обязателен, если реализация меняет user-facing task/opening surfaces.
- integration: обязателен для route/runtime boundary project-aware task flows.
- e2e smoke: по необходимости, если меняется сквозной flow выбора проекта и открытия задачи.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `npm run test:integration`
- browser/e2e-команда должна быть уточнена в ходе реализации, если change меняет пользовательский flow

Mock/fixture-данные и credentials:
- fixture-данные должны включать active project и task/opening scenario внутри него;
- live credentials не нужны.

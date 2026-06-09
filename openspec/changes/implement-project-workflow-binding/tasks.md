## Tasks

- [ ] 1. Зафиксировать project-aware contract для workflow layer.
- [ ] 2. Привязать workflow projection к active project context:
  - [ ] 2.1 `WorkflowStepInstance` знает `projectId`;
  - [ ] 2.2 workflow runtime не живёт как project-less глобальный процесс;
  - [ ] 2.3 change не фиксирует жёсткое `1:1` между шагом и верстаком.
- [ ] 3. Обновить OpenSpec specs для `workflow` и при необходимости `projects`.
- [ ] 4. Зафиксировать тестовую и traceability-рамку project-aware workflow binding.
- [ ] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: active project участвует в workflow layer.
- `workflow`: шаги решения и их состояние работают внутри project context.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для workflow projection и project-aware runtime models.
- component/browser: обязателен, если реализация меняет user-facing workflow surfaces.
- integration: обязателен для route/runtime boundary project-aware workflow flows.
- e2e smoke: по необходимости, если меняется сквозной flow выбора проекта и продолжения процесса решения.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `npm run test:integration`
- browser/e2e-команда должна быть уточнена в ходе реализации, если change меняет пользовательский flow

Mock/fixture-данные и credentials:
- fixture-данные должны включать active project и workflow scenario внутри него;
- live credentials не нужны.

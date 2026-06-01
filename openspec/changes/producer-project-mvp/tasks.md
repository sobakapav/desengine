## Tasks

- [ ] 1. Зафиксировать `producer-project-mvp` под `focus-domain` как owner первой delivery-волны project mode.
- [ ] 2. Описать минимальный контракт `Project MVP`:
  - [ ] 2.1 проект является контейнером независимой работы;
  - [ ] 2.2 новый проект создаётся с именем;
  - [ ] 2.3 новый проект обязательно выбирает базовый `UI kit`.
- [ ] 3. Зафиксировать влияние project-level `UI kit` на существующие сущности:
  - [ ] 3.1 `task` начинает жить внутри project contract;
  - [ ] 3.2 `workbench` и preview работают в контексте выбранного project `UI kit`;
  - [ ] 3.3 прогресс и валидность задач должны учитывать возможную смену `UI kit`.
- [ ] 4. Зафиксировать порядок постепенной project-scoped миграции:
  - [ ] 4.1 onboarding/task-слой;
  - [ ] 4.2 базовый `LLM` и ключ;
  - [ ] 4.3 `Figma` source;
  - [ ] 4.4 `Git` / `GitHub` repositories.
- [ ] 5. Развести границы первой волны и будущих направлений:
  - [ ] 5.1 явно исключить `Project Roadmap` из MVP;
  - [ ] 5.2 определить, какие downstream dispatcher/implement changes нужны для MVP;
  - [ ] 5.3 отделить project entity, task/workbench binding и progress invalidation как разные delivery-вопросы.
- [ ] 6. Обеспечить тестовую и traceability-готовность будущих behavior-change changes:
  - [ ] 6.1 указать ожидаемые уровни проверки для project entity, task/workbench binding и progress invalidation;
  - [ ] 6.2 зафиксировать требования к verification commands, mock/fixture-данным и coverage-plan для downstream-веток.
- [ ] 7. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить downstream-записи в `test/traceability/coverage-plan.json`, если конкретное покрытие будет отложено.

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `projects`: введение сущности проекта как feature-level контекста;
  - `task`: перенос task-смысла внутрь project contract;
  - `workbench` / `level-labs`: работа превью и верстаков в контексте project `UI kit`.
- Уровень проверки: static / traceability для producer-change.
- Команда запуска:
  - `npm run test:traceability`
- Mock/fixture-данные:
  - для самого producer-change не требуются;
  - downstream changes должны явно зафиксировать fixture/mocks для project state, `UI kit` migration и task/progress invalidation.
- Live credentials:
  - для самого producer-change не требуются;
  - downstream changes по `LLM`, `Figma`, `Git/GitHub` должны отдельно фиксировать свои credential expectations.

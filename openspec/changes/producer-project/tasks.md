## Tasks

- [ ] 1. Зафиксировать `producer-project` под `focus-domain` как owner первой delivery-волны внедрения сущности `Project`.
- [ ] 2. Описать минимальный контракт внедрения сущности `Project`:
  - [ ] 2.1 проект является контейнером независимой работы;
  - [ ] 2.2 новый проект создаётся с именем;
  - [ ] 2.3 новый проект обязательно выбирает базовый `UI kit`.
- [ ] 3. Зафиксировать, что ближайший downstream behavior-change — отдельный `implement`-change для `project entity and storage boundary`.
  - [ ] 3.1 change вводит каноническую сущность `ProjectWorkspace`;
  - [ ] 3.2 change определяет boundary выбора active project;
  - [ ] 3.3 change поднимает `project.settings.uiKitId` и `project.settings.uiMode` как единственный источник project preview contract;
  - [ ] 3.4 change не включает полную project-scoped миграцию `task`, `workflow`, `workbench` и progress.
- [ ] 4. Зафиксировать влияние project-level `UI kit` на существующие сущности:
  - [ ] 4.1 `task` начинает жить внутри project contract;
  - [ ] 4.2 workflow начинает жить внутри project contract как отдельный процесс решения;
  - [ ] 4.3 `workbench` и preview работают в контексте выбранного project `UI kit`;
  - [ ] 4.4 прогресс и валидность задач должны учитывать возможную смену `UI kit`.
- [ ] 5. Зафиксировать порядок постепенной project-scoped миграции:
  - [ ] 5.1 foundation: `ProjectWorkspace` и active project boundary;
  - [ ] 5.2 onboarding/task-слой;
  - [ ] 5.3 workflow как отдельный process-слой;
  - [ ] 5.4 `workbench` / preview binding;
  - [ ] 5.5 progress invalidation;
  - [ ] 5.6 базовый `LLM` и ключ;
  - [ ] 5.7 `Figma` source;
  - [ ] 5.8 `Git` / `GitHub` repositories.
- [ ] 6. Развести границы первой волны и будущих направлений:
  - [ ] 6.1 явно исключить `Project Roadmap` из MVP;
  - [ ] 6.2 определить, какие downstream dispatcher/implement changes нужны для MVP;
  - [ ] 6.3 отделить project entity, task binding, workflow binding, workbench binding и progress invalidation как разные delivery-вопросы.
- [ ] 7. Обеспечить тестовую и traceability-готовность будущих behavior-change changes:
  - [ ] 7.1 указать ожидаемые уровни проверки для project entity, task binding, workflow binding, workbench binding и progress invalidation;
  - [ ] 7.2 зафиксировать требования к verification commands, mock/fixture-данным и coverage-plan для downstream-веток.
- [ ] 8. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить downstream-записи в `test/traceability/coverage-plan.json`, если конкретное покрытие будет отложено.

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `projects`: введение сущности проекта как feature-level контекста;
  - `task`: последующий перенос task-смысла внутрь project contract после foundation-слоя;
  - `workflow`: отдельный process-слой решения внутри project context;
  - `workbench` / `level-labs`: последующая работа превью и верстаков в контексте project `UI kit` после появления `project.settings`.
- Уровень проверки: static / traceability для producer-change.
- Команда запуска:
  - `npm run test:traceability`
- Mock/fixture-данные:
  - для самого producer-change не требуются;
  - downstream changes должны явно зафиксировать fixture/mocks отдельно для `ProjectWorkspace`, project state, task binding, workflow binding, workbench binding и `UI kit` migration.
- Live credentials:
  - для самого producer-change не требуются;
  - downstream changes по `LLM`, `Figma`, `Git/GitHub` должны отдельно фиксировать свои credential expectations.

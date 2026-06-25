## Tasks

## Текущий фокус реализации

- Пока в активной реализации удерживаем только цепочку `проект -> workflow -> проверка/чеклист -> результат`.
- Внутри project-линии это значит:
  - `ProjectWorkspace` и active project boundary;
  - project-aware task/workflow контекст;
  - читаемый переход из проекта в работу и обратно;
  - влияние project contract на проверку и итоговый результат.
- Ветки `LLM`, `Figma`, `Git/GitHub` считаются отложенными до стабилизации основной цепочки.

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
  - [ ] 5.6 Отложено: базовый `LLM` и ключ после стабилизации основной цепочки.
  - [ ] 5.7 Отложено: `Figma` source после стабилизации основной цепочки.
  - [ ] 5.8 Отложено: `Git` / `GitHub` repositories после стабилизации основной цепочки.
- [x] 6. Развести границы первой волны и будущих направлений:
  - [x] 6.1 явно исключить `Project Roadmap` из MVP;
  - [x] 6.2 определить точную MVP decomposition как набор downstream waves:
    - [x] `implement-project-workspace-mvp` (`implement`);
    - [x] `implement-project-task-onboarding-binding` (`implement`);
    - [x] `implement-project-workflow-binding` (`implement`);
    - [x] `implement-project-workbench-preview-binding` (`implement`);
    - [x] `fix-project-ui-kit-migration-invalidation` (`fix`).
  - [x] 6.3 отделить project entity, task binding, workflow binding, workbench binding и progress invalidation как разные delivery-вопросы с запретом на их обратное слияние без нового producer-level решения.
- [x] 7. Обеспечить тестовую и traceability-готовность будущих behavior-change changes:
  - [x] 7.1 указать ожидаемые уровни проверки для foundation, task, workflow, workbench и migration waves:
    - [x] foundation: `static/contract` + `unit`;
    - [x] task: `static/contract` + `unit` + `integration`;
    - [x] workflow: `static/contract` + `unit`;
    - [x] workbench: `static/contract` + `unit` + `browser/runtime`;
    - [x] migration: `static/contract` + `unit` + `browser/runtime`.
  - [x] 7.2 зафиксировать требования к verification commands, mock/fixture-данным и coverage-plan для downstream-веток:
    - [x] каждая wave обязана пройти `npm run test:traceability`;
    - [x] wave с `unit` обязана указать `npm run test:unit -- <targeted-tests>`;
    - [x] task-wave обязана указать `npm run test:integration -- <task-route-tests>`;
    - [x] workbench/migration waves обязаны указать `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <spec...>`;
    - [x] все waves обязаны перечислить project-aware fixtures/mocks;
    - [x] при отсрочке покрытия обязателен `test/traceability/coverage-plan.json` с причиной, уровнем проверки и stage закрытия.
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
  - downstream changes обязаны явно зафиксировать fixture/mocks отдельно для:
    - `ProjectWorkspace` и active project selection;
    - project-aware task payloads и route fixtures;
    - workflow artifacts с `projectId`;
    - workbench/preview fixtures, читающих `project.settings`;
    - `UI kit` migration / invalidation fixtures.
- Live credentials:
  - для самого producer-change не требуются;
  - downstream changes по `LLM`, `Figma`, `Git/GitHub` должны отдельно фиксировать свои credential expectations.
- Downstream verification matrix, которую producer обязан задать заранее:
  - foundation-wave: `npm run test:traceability` + `npm run test:unit -- <project-workspace-focused-tests>`;
  - task-wave: `npm run test:traceability` + `npm run test:unit -- <task-project-boundary-tests>` + `npm run test:integration -- <task-route-tests>`;
  - workflow-wave: `npm run test:traceability` + `npm run test:unit -- <workflow-project-binding-tests>`;
  - workbench-wave: `npm run test:traceability` + `npm run test:unit -- <workbench-project-binding-tests>` + `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <workbench-specs>`;
  - migration-wave: `npm run test:traceability` + `npm run test:unit -- <ui-kit-migration-tests>` + `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <migration-specs>`;
  - если downstream wave не выполняет один из этих уровней в своей же поставке, она обязана добавить запись в `test/traceability/coverage-plan.json` с причиной, временным workaround и change/stage закрытия.

# Risk Register

## R1. Размывание сущности Project

- Приоритет: P0
- Симптом: `dispatcher-project-ui-kit-switching` и `research-dev-mode-project-work` оба вводят `Project`.
- Первопричина: в коде нет canonical `Project` contract и project-scoped storage.
- Последствие: два несовместимых shape/storage, сложная миграция, риск поломки lab UX.
- План: вводить `Project` один раз. `project-ui-kit-switching` должен стать узким seed-контрактом, который затем расширяет `dev-mode-project-work`.
- Тестовый след: unit/contract для schema/storage; e2e smoke переключения UI kit без перезагрузки; `npm run test:unit`, `npm run test:traceability`, при добавлении browser-flow `npm run test:e2e`.

## R2. Workbench остаётся компонентом, а не доменной сущностью

- Приоритет: P0
- Симптом: `Workbench.tsx` уже содержит рабочий стол, инструменты, state и действия, но контракта `WorkbenchDefinition/Instance` нет.
- Первопричина: lab вырос органически из одного сценария задачи.
- Последствие: image tools, layout workbench и future workflow начнут добавлять локальные registry/state/UX правила.
- План: сначала `task-and-workflow-entities-research`, затем `workbench-entity-workflow-step`; image inspector оформлять как частный случай `workbench-tools`.
- Тестовый след: contract/unit для registry и serialization; component/browser smoke для первого tool; traceability по `workbench`/`workbench-tools`.

## R3. API flows слишком много знают

- Приоритет: P0
- Симптом: `start`, `iterate`, `check` route handlers строят prompt, читают disk, вызывают LLM, валидируют payload и мутируют progress.
- Первопричина: flow не вынесен в application service слой.
- Последствие: сложно переиспользовать для project/dev-mode/workflow, сложно тестировать integration-flow.
- План: выделить service functions для `startTaskLevel`, `iterateTaskLevel`, `checkTaskLevel` без изменения UX.
- Тестовый след: integration/unit с mock LLM и temp user storage; smoke для route handlers.

## R4. User state не транзакционный

- Приоритет: P0
- Симптом: autosave, iterate, check и reset могут параллельно читать/писать progress и файлы.
- Первопричина: local FS storage не имеет lock/transaction boundary.
- Последствие: lost updates, частично записанные результаты, рассинхрон progress/check-result.
- План: ввести минимальный per-task mutation boundary для локального storage; сначала без смены хранилища.
- Тестовый след: unit/integration на конкурентные мутации с fixture storage.

## R5. Навигация `/lab` и `/tasks` расходится

- Приоритет: P1
- Симптом: часть lab routes редиректит в task routes; URL helpers разнесены между `lib/lab/navigation.ts`, `lib/task/navigation.ts`, `lib/system/navigation.ts`.
- Первопричина: исторический переход от task pages к lab workbench.
- Последствие: deep links, browser back и будущие workflow steps легко расходятся.
- План: зафиксировать canonical URL map и route ownership; оставить redirects только как compatibility.
- Тестовый след: unit/source-contract для URL helpers; e2e route smoke после снятия skip для `/tasks` и `/levels`.

## R6. File set частично hardcoded

- Приоритет: P1
- Симптом: рабочие файлы заданы в `desengine.config.json`, но Sandpack route и preview builder знают конкретные `Component.tsx`, `styles.ts`, `mock.ts`, `props.ts`, `stories`.
- Первопричина: fixed component-file-set MVP стал платформенным контрактом.
- Последствие: новый fileId или другой task type ломает preview/start/iterate/check.
- План: выделить `WorkbenchFileSet`/`ArtifactSet` contract и оставить component-file-set как один профиль.
- Тестовый след: unit для file set mapping; integration для Sandpack payload.

## R7. UI kit changes могут конфликтовать друг с другом

- Приоритет: P1
- Симптом: девять `ui-kit-*` changes меняют один и тот же Sandpack config/package/test слой.
- Первопричина: нет завершённого project-level UI kit switching и adapter template.
- Последствие: конфликты в `package.json`, CSS bootstrap, dependency mapping и traceability.
- План: сначала завершить `project-ui-kit-switching`; затем сделать один пилотный adapter; потом подключать kit'ы волнами.
- Тестовый след: shared adapter tests + per-kit smoke.

## R8. Event models могут размножиться

- Приоритет: P1
- Симптом: `user-experience-generalization`, `user-action-logging`, `cost-accounting-layer` вводят похожие event-сущности.
- Первопричина: нет общего privacy-first event/scoping contract.
- Последствие: три журнала с разными redaction/export/delete правилами.
- План: перед реализацией этих changes зафиксировать общий `EventLog`/`EventEnvelope` или хотя бы shared scoping/privacy rules.
- Тестовый след: unit/contract для schema/redaction/retention; traceability по каждому behavior-change.

## R9. Packaging может преждевременно зацементировать storage

- Приоритет: P1
- Симптом: cloud/electron changes требуют storage, migrations, secrets и deployment, но `Project/Task/Artifact` ещё нестабильны.
- Первопричина: packaging хочется планировать раньше доменной стабилизации.
- Последствие: разные storage-подходы для local/cloud/electron.
- План: cloud/electron держать как исследовательские до стабилизации project/task/storage contracts.
- Тестовый след: на этом этапе только architecture/contract plan; behavior tests после выбора storage.

## R10. UX может пострадать от архитектурной чистки

- Приоритет: P0
- Симптом: текущий lab уже полезен пользователю, но многие рефакторинги затрагивают save, preview, prompt composer, check/reset.
- Первопричина: core UX и техническое ядро сильно переплетены.
- Последствие: улучшение архитектуры ценой потери доверия пользователя.
- План: любые изменения lab делать через совместимые вертикальные срезы; сначала добавить страховочные integration/e2e checks.
- Тестовый след: browser/integration smoke для `start -> edit -> save -> preview -> iterate/check/reset` на mock LLM.

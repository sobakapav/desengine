# Roadmap

## Принцип порядка

Порядок развития должен уменьшать архитектурный риск, а не максимизировать количество фич за итерацию. Главный продуктовый инвариант: текущий lab должен оставаться понятным и рабочим.

## Итерация 1. Стабилизировать lab как продуктовый runtime

### 1. Завершить `research-architecture-capital-analysis-2026-05-19`

- Тип: research/architecture.
- Результат: AS-IS map, risk register, TO-BE, guardrails, roadmap.
- Тестовый уровень: не требуется behavior test; требуется план тестирования для будущих changes.
- Команды проверки: `npm run openspec`, `npm run test:full` как sanity check.

### 2. Продвинуть `dispatcher-openspec-custom-schema`

- Тип: tooling/process.
- Зачем: текущим changes уже нужны явные `type/status/depends_on/affected_capabilities/test_level`.
- Зависимости: нет жёстких runtime-зависимостей.
- Тестовый уровень: static/contract + unit.
- Команды: `npm run test:traceability`, `npm run test:unit`.

### 3. Создать отдельный hardening-change для lab runtime

Фактическое имя: `implement-lab-runtime-contract-hardening`.

Scope:

- canonical URL map для `/lab` и `/tasks`;
- единая фабрика empty task data;
- тонкий application service boundary для start/iterate/check без изменения UX;
- минимальный per-task mutation boundary для локального storage;
- service-level checks с mock LLM для критичного lab flow;
- проверка client-side UX лимитов prompt/check/reset.

Тестовый уровень:

- unit/contract для URL helpers и data factory;
- unit/service для actions с fixture storage/mock LLM;
- browser/e2e smoke — отдельным follow-up, если меняется пользовательский flow.

Команды:

- `npm run test:unit`
- `npm run test:traceability`

### 4. Реализовать `dispatcher-project-ui-kit-switching`

- Тип: behavior-change.
- Зачем: первый безопасный vertical slice `Project`, видимый пользователю и нужный девяти `ui-kit-*` changes.
- Scope: минимальный `Project` только для lab/Sandpack config; `uiKitId`; `uiMode`; переключение без перезагрузки; диагностика/fallback.
- Не делать: полный dev-mode, импорт, roadmap, cloud/electron storage.
- Тестовый уровень: unit/contract + browser smoke.
- Команды: `npm run test:unit`, `npm run test:traceability`, `npm run build`; при автоматизации browser-flow `npm run test:e2e`.

## Итерация 2. Выделить Workbench и Workflow

### 5. `research-task-and-workflow-entities-research`

- Тип: research/contract.
- Зачем: определить `Task`, `Artifact`, `WorkflowDefinition/Step/Instance` до массового расширения workbench.
- Зависимости: желательно учитывать минимальный `Project` из iteration 1.
- Тестовый уровень: план будущих contract/unit/e2e проверок.

### 6. `dispatcher-workbench-entity-workflow-step`

- Тип: research + затем behavior changes.
- Зачем: оформить текущий lab workbench как частный случай общей сущности.
- Зависимость: `task-and-workflow-entities-research`.
- Тестовый уровень: unit/contract для registry/state; component/browser smoke для первого workbench instance.

### 7. `research-lab-image-inspector-tools-plan`

- Тип: research/plan.
- Зачем: развивать image inspector как workbench tool, а не отдельную подсистему.
- Зависимость: согласовать с `workbench-entity-workflow-step`.
- Тестовый уровень: browser/e2e smoke для tool UX; unit для tool state.

### 8. `dispatcher-workbench-layout-space`

- Тип: research/plan, затем behavior.
- Зачем: первый специализированный layout/tool сценарий.
- Зависимость: `workbench-entity-workflow-step`.
- Тестовый уровень: component/browser + e2e smoke на сохранение состояния инструмента.

## Итерация 3. Расширять UX без размножения платформенных моделей

### 9. `dispatcher-task-hints-templating`

- Зачем: безопасный UX win после стабилизации prompt context.
- Зависимость: общий context contract из Project/Task/Level.
- Тестовый уровень: unit/contract + traceability.
- Команды: `npm run test:unit`, `npm run test:traceability`.

### 10. `dispatcher-prompt-builder`

- Зачем: альтернативный режим ввода без форка LLM pipeline.
- Зависимость: желательно после prompt context contract; не блокируется experience, но должен быть совместим с ним.
- Тестовый уровень: unit compile/serialize + browser smoke для preview/execute.

### 11. UI kit wave

- Сначала один пилотный kit после `project-ui-kit-switching`.
- Затем 1-2 kit за волну.
- Не делать девять независимых changes одновременно.
- Кандидаты для пилота: `implement-ui-kit-radix-ui` или `implement-ui-kit-react-aria` для headless/accessibility-oriented проверки; `implement-ui-kit-mantine` как более full-stack UI kit.
- Тестовый уровень: shared adapter unit tests + per-kit smoke.

## Отложить до стабилизации контрактов

### `research-dev-mode-project-work`

Делать после минимального project switching и lab hardening. Это расширение `Project` до workspace, а не второй ввод проекта.

### `idea-figma-project-import-adapter`

Ждёт `Project + Artifact + Storage` contract.

### `research-project-roadmap-entity`

Ждёт `Project + Task/Workflow`.

### `research-user-experience-generalization`, `research-user-action-logging`, `idea-cost-accounting-layer`

Проектировать вместе как privacy-first event/scoping layer. Не реализовывать тремя независимыми журналами.

### `research-expertise-attractors`, `research-skill-map`

После Experience Log и понятного event evidence.

### `idea-packaging-electron-app`, `idea-packaging-cloud-access`

Пока держать как исследовательские/planning changes. Behavior implementation начинать после стабилизации storage/project/task contracts.

### `research-devops-layer-plan`

Можно вести как planning параллельно, но CD/release/cloud/electron решения не должны опережать выбор packaging/storage architecture.

## Traceability plan

Для каждого будущего behavior-change фиксировать:

- затронутые `openspec/specs/**` capabilities/scenarios;
- уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider;
- команду запуска;
- mock/fixture данные;
- live credentials, если нужны;
- запись в `test/traceability/coverage-plan.json`, если покрытие откладывается.

Приоритет для ближайших тестов:

- lab route/canonical navigation;
- mock LLM start/iterate/check;
- user storage mutation boundary;
- project UI kit switching browser smoke;
- Sandpack payload compatibility.

## Dispatcher 2026-05-20

После стабилизационного прохода дальнейшая архитектурная работа режется отдельным dispatcher-change:

`dispatcher-architecture-transformation`

Новая последовательность transformation changes к исполнению:

1. `implement-project-workspace-storage-boundary`
2. `implement-task-workflow-artifact-contract`
3. `dispatcher-platform-component-sourcing-strategy`
4. `implement-workbench-platform-registry`
5. `implement-prompt-context-runtime-boundary`
6. `idea-event-envelope-experience-cost-boundary`
7. `dispatcher-packaging-readiness-storage-adapters`

`code-readability-practices-2026-05-19` включён в эту орбиту как governance baseline: его формулировки считаются достаточно проработанными, но он не становится runtime-блокером для следующей архитектурной волны.

`dispatcher-platform-component-sourcing-strategy` закрывает отдельный архитектурный принцип: по максимуму использовать зрелые готовые primitives (Sandpack, Konva, Monaco, shadcn/Radix, Mermaid, Storybook/Vitest/Playwright и аналоги), но только через осознанный выбор `reuse / adapt / build`, чтобы не переписывать сильные библиотеки вручную и не тащить зависимости без ownership boundary.

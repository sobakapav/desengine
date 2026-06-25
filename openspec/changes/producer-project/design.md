## Контекст

Ранняя идея project mode уже зафиксировала продуктовую гипотезу: desengine должен поддерживать независимые проекты внутри одной оболочки, а roadmap проекта должен появиться позже, после стабилизации базового project mode.

Из обсуждения дополнительно прояснилось следующее:

- проект нужен не как отдельная фича рядом с существующими сущностями, а как новый верхний контекст;
- первым должен появиться сам `Project`;
- новый проект в MVP создаётся минимум с именем и обязательным базовым `UI kit`;
- `UI kit` становится не локальной настройкой, а жёстким глобальным контрактом проекта;
- workflow является не задачей и не верстаком, а отдельным процессом решения внутри проекта;
- смена project-level `UI kit` допустима, но является сложной миграцией и может откатить часть уже выполненных задач в невыполненные;
- первым implementation-срезом не должна становиться полная project-mode миграция; сначала нужен отдельный foundation-change, который вводит `ProjectWorkspace`, active project boundary и `project.settings`;
- дальнейшая project-scoped миграция идёт очень постепенно: onboarding/task-слой, затем workflow как отдельный процессный слой, затем `workbench`, затем тяжёлая `UI kit` migration, а уже после этого `LLM`, `Figma` и `Git/GitHub`.

Текущий practical focus этой линии сужен: сначала нужно выровнять основную цепочку `проект -> workflow -> проверка/чеклист -> результат`, а все интеграционные ветки после `workbench` считаются отложенными.

Поэтому нужен не новый `idea`, а `producer`, который переведёт эту гипотезу в первую delivery-рамку feature-уровня.

## Goals

- Зафиксировать `Project` как первый delivery-owned domain context внутри `focus-domain`.
- Определить минимальный смысл проекта:
  - контейнер независимой работы;
  - имя проекта;
  - обязательный базовый `UI kit`.
- Делегировать ближайший implementation-шаг в отдельный downstream change `project entity and storage boundary`.
- Зафиксировать, что project-level `UI kit` становится контрактом для уже существующих сущностей.
- Подготовить downstream map для постепенного переноса существующих частей продукта под `Project`.
- Зафиксировать, что workflow является отдельным process-слоем решения и не должен смешиваться ни с задачей, ни с верстаком.

## Non-goals

- Не проектировать сейчас полноценный `Project Roadmap`.
- Не принимать окончательные решения по UX главного экрана проекта.
- Не переводить все user-scoped сущности в project-scoped за один шаг.
- Не делать кодовые изменения напрямую.

## Решение

### 1. `Project` вводится как новый верхний feature context

MVP должен ввести не просто ещё одну сущность данных, а новый контекст, через который будут интерпретироваться уже существующие части системы.

Это означает:

- задача существует не абстрактно, а внутри проекта;
- workflow существует внутри проекта как отдельный процесс решения;
- workbench и preview работают в рамках project contract, но не подменяют workflow;
- артефакты и прогресс со временем тоже начинают оцениваться относительно проекта.

Но этот producer не должен пытаться сразу превратить весь runtime в project-scoped систему. Его ближайшая задача — делегировать foundation-change, который сначала делает сам проект реальной границей в системе.

### 1.1. Первый downstream шаг — `project entity and storage boundary`

Ближайшим implementation-срезом producer обязан считать отдельный `implement`-change для `project entity and storage boundary`.

Этот change должен:

- ввести каноническую сущность `ProjectWorkspace`;
- определить boundary выбора active project;
- поднять `project.settings` как единый источник `uiKitId` и `uiMode`;
- дать runtime и preview возможность читать project contract без ad-hoc shapes.

Этот change не должен в той же волне:

- массово перепривязывать task state к project progress;
- вводить workflow ownership внутрь foundation-слоя;
- вводить invalidation прогресса при смене `UI kit`;
- переносить `LLM`, `Figma` или `Git/GitHub` в project scope.

### 2. Базовый `UI kit` является обязательной частью проекта

Минимальный новый проект создаётся с двумя обязательными вещами:

- имя проекта;
- базовый `UI kit`.

`UI kit` становится project-level contract:

- все задачи проекта должны использовать один и тот же базовый visual/runtime контекст;
- workflow и workbench должны опираться на один и тот же project contract;
- downstream changes не должны трактовать kit как локальную, легко изолируемую настройку отдельной задачи.

### 3. Workflow является отдельным процессным слоем

Workflow не равен ни задаче, ни верстаку. Для первой project-wave это значит:

- task layer отвечает за открытие и ведение задачи в проекте;
- workflow layer отвечает за процесс решения внутри project context;
- workbench layer отвечает за рабочий контур и preview semantics;
- между этими слоями нельзя терять `projectId`, но нельзя и склеивать их в одну сущность ради упрощения первой реализации.

### 4. Смена `UI kit` считается тяжёлой migration-операцией

Producer заранее фиксирует важное продуктовое ожидание:

- `UI kit` проекта можно сменить;
- но это не обычный toggle;
- часть уже пройденных задач и их прогресса может перестать считаться валидной и откатиться.

Это решение критично для всех downstream веток, потому что оно меняет смысл:

- прогресса;
- task validity;
- workflow continuity;
- workbench compatibility;
- fixture expectations для тестов.

### 5. Project-scoped миграция идёт поэтапно и через конкретные delivery-waves

Producer задаёт не только общий порядок, но и точную MVP decomposition, которую downstream changes не должны переоткрывать без нового producer-level решения:

1. `implement-project-workspace-mvp` (`implement`)
   - scope: `ProjectWorkspace`, active project boundary, `project.settings.uiKitId`, `project.settings.uiMode`;
   - не включает task/workflow/workbench migration и progress invalidation.
2. `implement-project-task-onboarding-binding` (`implement`)
   - scope: project-aware task onboarding, open/start/check/save/reset boundaries;
   - не включает workflow ownership и `UI kit` invalidation semantics.
3. `implement-project-workflow-binding` (`implement`)
   - scope: project-aware workflow artifacts, process-layer bindings и runtime boundary для workflow;
   - не включает workbench-preview contract и migration notices.
4. `implement-project-workbench-preview-binding` (`implement`)
   - scope: project-aware workbench shell, preview/runtime contract и workbench-level context propagation;
   - не включает progress invalidation semantics.
5. `fix-project-ui-kit-migration-invalidation` (`fix`)
   - scope: смена project `UI kit` как отдельная migration-операция, invalidation правил, notices и verification вокруг migration path;
   - не переоткрывает foundation/task/workflow decomposition.
6. Последующие product waves
   - project-level `LLM` binding;
   - `Figma` binding;
   - `Git` / `GitHub` binding.

Такой порядок нужен, чтобы постепенно проверять последствия project context для уже существующих сущностей, а не перепривязывать всё одновременно.

### 5.1. Допустимая orchestration-обёртка

Producer фиксирует decomposition на уровне behavior-changes, а не на уровне одного обязательного release/dispatcher shape.

Это означает:

- downstream waves могут быть собраны под release-level или dispatcher-level orchestration;
- но состав MVP-wave и границы между foundation/task/workflow/workbench/migration остаются фиксированными;
- запрещено сливать `workflow binding` в `task binding` или `progress invalidation` в foundation-wave без нового producer-level решения.

### 5.2. Нормативная verification-рамка downstream волн

Producer заранее фиксирует минимально допустимую verification-модель для каждой MVP-wave.

#### Foundation: `implement-project-workspace-mvp`

- уровни проверки: `static/contract`, `unit`;
- обязательные команды:
  - `npm run test:traceability`
  - `npm run test:unit -- <project-workspace-focused-tests>`
- обязательные fixtures/mocks:
  - `ProjectWorkspace` fixture;
  - active project selection fixture;
  - project settings fixture c `uiKitId` и `uiMode`.

#### Task: `implement-project-task-onboarding-binding`

- уровни проверки: `static/contract`, `unit`, `integration`;
- обязательные команды:
  - `npm run test:traceability`
  - `npm run test:unit -- <task-project-boundary-tests>`
  - `npm run test:integration -- <task-route-tests>`
- обязательные fixtures/mocks:
  - task fixture, привязанный к `projectId`;
  - project-aware request payloads для open/start/check/save/reset;
  - task route fixture c active project context.

#### Workflow: `implement-project-workflow-binding`

- уровни проверки: `static/contract`, `unit`;
- обязательные команды:
  - `npm run test:traceability`
  - `npm run test:unit -- <workflow-project-binding-tests>`
- обязательные fixtures/mocks:
  - workflow artifact fixture c `projectId`;
  - runtime fixture для process-layer boundary между task/workflow/workbench.

#### Workbench: `implement-project-workbench-preview-binding`

- уровни проверки: `static/contract`, `unit`, `browser/runtime`;
- обязательные команды:
  - `npm run test:traceability`
  - `npm run test:unit -- <workbench-project-binding-tests>`
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <workbench-specs>`
- обязательные fixtures/mocks:
  - workbench fixture c active project context;
  - preview/runtime fixture, читающий `project.settings`;
  - browser fixture для project-aware preview path.

#### Migration: `fix-project-ui-kit-migration-invalidation`

- уровни проверки: `static/contract`, `unit`, `browser/runtime`;
- обязательные команды:
  - `npm run test:traceability`
  - `npm run test:unit -- <ui-kit-migration-tests>`
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <migration-specs>`
- обязательные fixtures/mocks:
  - project `UI kit` switch fixture;
  - invalidation fixture для completed/in-progress task state;
  - browser/runtime fixture для migration notice и project-aware preview after switch.

### 5.3. Обязательное правило coverage-plan при отсрочке

Если downstream wave не закрывает один из требуемых уровней проверки в своей же волне, она обязана:

- добавить запись в `test/traceability/coverage-plan.json`;
- назвать конкретный недостающий capability/scenario;
- указать, какой уровень проверки отложен (`unit`, `integration`, `browser/runtime`, `live/provider`);
- описать mock/fixture или credential gap;
- указать change или stage, в котором покрытие будет закрыто.

## Риски и компромиссы

- Если producer опишет `Project` слишком абстрактно, downstream changes начнут трактовать его по-разному и породят несовместимые boundaries.
- Если первым change попробовать одновременно ввести project entity, task binding, workflow binding и progress invalidation, первая волна расползётся и потеряет проверяемость.
- Если producer попытается сразу включить roadmap, `LLM`, `Figma` и `Git/GitHub`, MVP расползётся и перестанет быть первой волной.
- Если не зафиксировать жёсткий статус `UI kit`, downstream задачи могут продолжить жить в старой логике локальных переключений и сломают проектный контракт.
- Если растворить workflow внутри `workbench`, проектный процесс решения не получит собственной границы и ownership.

## Открытые вопросы

- Какой минимальный UX входа в проект нужен для первой волны, если решение о стартовом экране пока отложено.
- Нужно ли вводить отдельный live/provider verification в будущих `LLM`, `Figma` и `Git/GitHub` waves или достаточно будет release-level orchestration поверх их собственных changes.

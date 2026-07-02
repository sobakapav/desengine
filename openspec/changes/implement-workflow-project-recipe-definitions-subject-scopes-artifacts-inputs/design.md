## Контекст

Сейчас код и active spec-слой уже содержат важную, но слишком узкую версию workflow:

- `ProjectComponent.workflowKind` знает только `image-to-component-workflow`;
- `ProjectSession.workflowKind` зафиксирован как `project-design-workflow`;
- `listProjectWorkflowStages(...)` жёстко строит один и тот же набор project stages;
- `workflow readout` выводится из состояния проекта и компонента, а не из самостоятельного каталога проектных операций.

Такая модель полезна для первой короткой цепочки, но не масштабируется на каталог продуктовых workflow.

## Решение

### 1. Workflow становится каталогом операций

Новая базовая мысль:

- `workflow` описывает не только последовательность шагов;
- `workflow` ещё и классифицирует тип проектной операции.

То есть пользователь работает не “в абстрактном workflow”, а запускает один из шаблонов операций:

- создать компонент;
- собрать экран;
- сгенерировать mock-данные;
- адаптировать стиль;
- сделать migration UI kit;
- собрать Storybook;
- разложить Figma-проект;
- выделить доменную модель.

### 2. Нужна явная модель subject

Одна из главных проблем текущего слоя: workflow не умеет честно отвечать на вопрос “над чем мы сейчас работаем”.

Поэтому вводится `WorkflowSubject` с минимальными kind:

- `project`;
- `component`;
- `component-set`;
- `screen`;
- `screen-set`;
- `data-set`;
- `domain-model`;
- `storybook-layer`;
- `prototype`;
- `reference-pack`;
- `design-system-migration`.

Это важнее, чем просто расширить список `workflowKind`, потому что один и тот же workflow family может запускаться над разными subject scopes.

### 3. Нужны definition и run

Минимальная рабочая структура:

- `WorkflowDefinition`
  - `id`
  - `title`
  - `summary`
  - `operationFamily`
  - `subjectKinds`
  - `requiredInputs`
  - `producedArtifacts`
  - `stepDefinitions`
  - `entrySurfaces`
  - `followUpWorkflowIds`
- `WorkflowRun`
  - `id`
  - `definitionId`
  - `projectId`
  - `subject`
  - `status`
  - `activeStepId`
  - `inputSnapshot`
  - `artifactBindings`
  - `startedAt`
  - `updatedAt`
- `WorkflowStepDefinition`
  - `id`
  - `title`
  - `kind`
  - `requiredArtifacts`
  - `resultArtifacts`
  - `toolProfile`
  - `completionContract`

Это отделяет:

- reusable шаблон операции;
- его конкретный запуск;
- текущий пользовательский readout.

### 4. Project хранит не один recipe, а доступный набор workflow templates

Сейчас проект знает по сути один `workflowTemplateId`.

Для следующей волны проекту нужен хотя бы conceptual уровень:

- `availableWorkflowDefinitions`;
- `preferredWorkflowBindings`;
- `defaultDefinitionBySubjectKind`.

Это не означает, что надо сразу строить тяжёлый editor workflow catalog. Но это означает, что архитектура должна перестать считать один recipe единственной формой workflow.

### 5. Artifact и PromptContext должны стать workflow-aware по-настоящему

Чтобы workflow обслуживал примеры пользователя, нужно, чтобы он объявлял:

- какие входы требуются;
- какие выходы ожидаются;
- какие artifacts обязательны;
- какие artifacts создаются по шагам.

Иначе workflow останется “названием процесса”, а не рабочим контрактом.

Из этого следует:

- artifacts становятся slot-based;
- PromptContext строится с учётом `definition`, `subject`, `step`, `inputs`, `artifact bindings`;
- data/domain workflows получают ту же контрактную опору, что и component workflows.

### 6. Workflow должен поддерживать разные launch surfaces

Ваш список примеров показывает, что workflow стартует не из одной точки.

Примеры entry surfaces:

- карточка компонента;
- страница проекта;
- карта экранов;
- слой данных;
- слой Storybook;
- импорт Figma;
- system-wide refactor surface.

Поэтому в `WorkflowDefinition` нужно хранить не только шаги, но и допустимые пользовательские точки входа.

### 7. Семейства workflow, которые архитектура должна выдерживать

Минимальная верхнеуровневая классификация:

- `component-creation`
- `component-composition`
- `screen-composition`
- `system-extraction`
- `system-refactor`
- `ui-kit-migration`
- `data-generation`
- `storybook-build`
- `storybook-integration`
- `documentation`
- `figma-import`
- `style-adaptation`
- `diagram-generation`
- `domain-modeling`
- `parameterization`
- `scenario-to-interfaces`
- `interactive-state-design`
- `loading-state-simulation`
- `batch-component-production`

Важно, что это не просто список id. Это список operation families, поверх которых потом можно строить конкретные definitions.

## Компромиссы первой волны

- Этот change не обязан сразу реализовать runtime engine всех workflow.
- Он должен сначала переложить мышление и contract boundary.
- На первом этапе достаточно подготовить spec-слой, каталог примеров и следующую волну foundation-реализации.

## Первый seed set definitions

Чтобы следующая реализация не стартовала с пустого места, в foundation выбраны пять первых definitions:

1. `component-from-image-or-figma`
2. `component-composition`
3. `screen-composition`
4. `ui-kit-migration`
5. `mock-data-and-loading-states`

Этот набор намеренно покрывает разные оси продукта:

- компонент;
- набор компонентов;
- экран;
- migration проекта;
- данные и loading states.

Он не закрывает весь каталог, но уже ломает старую ложную рамку, где workflow якобы существует только вокруг одного component recipe.

## Что это меняет в приоритете

Срочная короткая цепочка `проект -> компонент -> работа` остаётся важной.

Но теперь у неё появляется нормальное место в более широкой архитектуре:

- она становится первым vertical slice;
- а не скрытым “главным workflow продукта навсегда”.

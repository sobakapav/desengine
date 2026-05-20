# Target Architecture TO-BE

## Цель

Целевая архитектура должна сохранить текущий пользовательский lab как рабочий продуктовый опыт, но постепенно отделить доменные контракты от исторического component-level runtime. Вектор развития:

```text
Local educational lab
  -> Project-scoped workspace
  -> Task/Workflow/Artifact model
  -> Workbench platform
  -> Experience/Cost/Event layers
  -> Import/Packaging extensions
```

## Целевые границы

### Project

`Project` становится верхним пользовательским scope для dev-mode и будущих импортов.

Текущий MVP (`dispatcher-project-ui-kit-switching`):

- `projectId`
- `title`
- `uiKitId`
- `uiMode`

Следующий Project Workspace MVP должен расширить это до:

- `createdAt`
- `updatedAt`

Правило: `dispatcher-project-ui-kit-switching` может ввести минимальный `Project`, но не должен создавать shape, несовместимый с `research-dev-mode-project-work`.

### Storage

Текущий `user/` storage остаётся MVP, но получает явные границы:

- project-scoped area;
- task/workbench artifacts;
- progress/check-result;
- event logs;
- export/delete policies.

На этом этапе не требуется менять стек или хранилище. Требуется ввести контракт доступа к storage и mutation boundary, чтобы будущие cloud/electron changes не зависели от scattered `fs` calls.

### Task, Workflow и Artifact

Текущая задача уровня становится частным случаем более общей модели.

```text
Task
  -> input Artifacts
  -> WorkflowInstance
    -> WorkflowStep
      -> WorkbenchInstance
      -> output Artifacts
```

MVP `Artifact` должен покрывать:

- source image/reference;
- generated code file;
- prompt/history entry;
- check-result;
- imported design asset;
- future cost/experience evidence.

### Workbench

Workbench становится платформенной сущностью, а текущий lab workbench — её первым instance/profile.

Целевой контракт:

- `WorkbenchDefinition`: id, title, supported task/workflow step types, layout, tools.
- `WorkbenchInstance`: projectId, taskId, workflowStepId, artifact bindings, serialized state.
- `WorkbenchTool`: id, title, applicability, state schema, actions, rendering boundary.

Image inspector и layout workbench должны использовать этот общий tool contract, а не создавать параллельные registry.

### Prompt Context

Prompt, task hints и будущий prompt builder должны использовать общий context contract:

- project;
- task;
- workflow step;
- level/lab profile;
- artifacts;
- selected tools;
- user text;
- constraints;
- provider/runtime capabilities.

Правило: `task-hints-templating` и `prompt-builder` не должны расходиться по переменным контекста.

### Event, Experience и Cost

Перед реализацией `experience`, `user-action-log` и `cost-accounting` нужен общий событийный envelope:

- `eventId`
- `kind`
- `projectId`
- `taskId`
- `workflowStepId`
- `createdAt`
- `privacyClass`
- `payload`
- `redactionState`

Cost events и experience events могут иметь разные payload, но должны разделять scoping, privacy, export/delete и retention policies.

### API/Application services

Route handlers должны стать тоньше:

```text
route handler
  -> auth/access guard
  -> parse request
  -> application service
  -> response mapping
```

Application services:

- `startTaskLevel`
- `iterateTaskLevel`
- `checkTaskLevel`
- `saveWorkbenchFiles`
- `resetTask`
- будущие `switchProjectUiKit`, `openWorkbenchStep`, `recordEvent`.

Это не должно менять пользовательское поведение, но должно сделать flows тестируемыми без полного browser/runtime.

## Guardrails

- Пользовательский опыт lab имеет приоритет над архитектурной чистотой.
- Не менять Node.js, сборщик, Turbopack и другие install-critical части без отдельного явного решения.
- Не вводить parallel `Project`, `Workbench`, `Artifact`, `Event` shapes.
- Любой behavior-change должен иметь OpenSpec-сценарии и тестовую часть на русском языке.
- Для lab changes обязательна проверка не только source-contract, но и хотя бы один integration/browser smoke, если меняется пользовательский flow.
- Смена storage должна идти через contract и adapter boundary, а не прямую миграцию всех вызовов `fs`.
- `ui-kit-*` changes должны идти после project-level UI kit switching и общего adapter contract.
- Image tools должны расширять `workbench-tools`, а не обходить его.
- Event/cost/experience слои должны быть privacy-first и local-first на MVP.
- Cloud/electron packaging не должны стартовать как behavior implementation до стабилизации project/task/storage contracts.

## TO-BE схема

```text
Product Shell
  -> Project Workspace
    -> Task Catalog / Task Instances
      -> Workflow Instances
        -> Workbench Instances
          -> Tools
          -> Artifacts
          -> Prompt Context
          -> Sandpack Preview

Storage Adapter
  -> project data
  -> user progress
  -> artifacts
  -> event logs

Quality Layer
  -> OpenSpec specs/changes
  -> unit/contract tests
  -> integration tests with mock LLM
  -> browser/e2e smoke for critical UX
  -> traceability map
```

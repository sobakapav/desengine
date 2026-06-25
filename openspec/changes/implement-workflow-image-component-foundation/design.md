## Контекст

Сейчас в системе уже есть:
- project-aware task runtime;
- workflow/artifact projection;
- Workbench как materialization workflow step;
- проектный readout workflow/artifacts.

Но текущая проекция остаётся legacy-центричной:
- `taskType` и `workflow definition` завязаны на `level-lab`;
- runtime создаёт ровно один step, который равен текущему уровню;
- workbench surface и project readout читают именно `уровень`, а не workflow;
- пользовательская модель `работаем над workflow` отсутствует.

При этом переписывать storage и task actions сейчас рано: они уже несут полезный legacy-прогресс, который можно переиспользовать как bridge.

## Решение

### 1. Канонический workflow поверх legacy runtime

Вводится workflow типа `image-to-component-workflow`.

Он состоит из:
- одного исполняемого coordinator step `Работаем над workflow`;
- набора смысловых workflow points, которые описывают состав результата:
  - `ui-kit-component`;
  - `styles`;
  - `mock-data`;
  - `props-contract`;
  - `storybook`.

Coordinator step становится `currentStepId` и единственной точкой привязки Workbench/prompt-runtime. Это позволяет уже сейчас заменить старую модель `текущий уровень = текущий workflow step` на новую модель `идёт работа над workflow целиком`.

### 2. Workflow points как наблюдаемый слой

Workflow points не получают собственный Workbench и не требуют отдельного orchestration-движка на этом этапе.

Они нужны, чтобы:
- показать состав workflow как набор смысловых пунктов;
- построить bridge от legacy-level semantics к новой структуре;
- дать следующему этапу пользовательского слоя готовую ось для UI и критериев.

Для каждого point фиксируются:
- machine-readable `id` и `kind`;
- пользовательский заголовок;
- набор связанных artifact/file id;
- legacy-level hint для bridge-статуса.

### 3. Legacy-bridge без миграции storage

Источником истины для текущей реализации остаются:
- `taskItem.progress.currentLevel`;
- `taskItem.progress.isCompleted`;
- `taskData.labContext.levelNumber`;
- наличие рабочих файлов/artifacts.

Bridge работает так:
- coordinator step status строится из текущего task/check состояния, как и раньше;
- point status оценивается по сочетанию legacy-level progress и связанных artifacts;
- storage не меняется;
- task actions не переписываются под новый orchestrator.

### 4. Граница этого change

В этот change входит:
- новая workflow-проекция;
- новые подписи/labels для workflow surface;
- обновление workbench definition под новый task/workflow kind;
- unit/source-contract покрытие;
- OpenSpec delta.

В этот change не входит:
- новый UI orchestration layer для редактирования/переключения point-ов;
- отдельные workflow mutation API;
- явная dependency model между point-ами;
- отказ от всех legacy level concepts во всём runtime.

## Риски и компромиссы

### Почему не делаем сразу полноценный workflow engine

Потому что сейчас важнее быстро получить реальную замену модели исполнения, которую можно нарастить пользовательским слоем, чем зависнуть на полном перепроектировании task/storage.

### Почему coordinator step один

Потому что пользователь явно хочет одно действие `Работаем над workflow` с возможностью итераций по workflow целиком. Coordinator step отражает именно этот смысл и не ломает существующую связку Workbench/prompt-runtime.

### Почему points пока наблюдаемые, а не отдельные рантайм-потоки

Потому что смысловая декомпозиция уже нужна для UI и модели результата, а отдельный orchestrator можно вводить следующим change, не ломая текущую базу.

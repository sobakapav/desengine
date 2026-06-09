## Why

`level-labs` помогли быстро собрать ранний продуктовый контур, но следующая волна архитектурной трансформации уже требует другой рабочей модели:

- `project` становится долгоживущим контекстом;
- `task` и `workflow` становятся first-class сущностями;
- `workbench` должен стать главной рабочей поверхностью.

Если не закрепить отдельный producer на controlled dismantling level-модели, лаборатории будут продолжать диктовать язык продукта, routing и sequencing downstream changes.

## What Changes

- Создаётся `producer-kill-levels` под `focus-domain`.
- Producer закрепляет, что `level-labs` больше не являются долгосрочной целевой пользовательской моделью.
- Producer описывает controlled transition:
  - какие части level-модели считаются legacy;
  - какие части переносятся в `workflow`, `task` и `workbench`;
  - какие части могут быть просто удалены после замены.
- Producer задаёт критерии readiness для демонтажа level-модели:
  - существует заменяющая схема `project -> task -> workflow -> workbench`;
  - user-facing language больше не зависит от уровня как основной сущности;
  - routing cleanup не идёт раньше новой рабочей модели;
  - transition не ломает traceability действующих capability.

## Non-goals

- Не делать routing cleanup кодом прямо сейчас.
- Не реализовывать новый Workbench или Workflow внутри этого change.
- Не заводить отдельный dispatcher ради временной transition-линии.

## Capabilities

### Potentially Modified Capabilities
- `level-labs`
- `workflow`
- `workbench`
- `task`
- `projects`

## Impact

- `focus-domain` получает producer-линию controlled dismantling для level-driven модели.
- Следующие changes перестают трактовать legacy-lab UX как долгосрочный фундамент.
- Переход away from `level-labs` получает явные критерии допуска и порядок.

## Acceptance Criteria

- В active OpenSpec есть `producer-kill-levels` под `focus-domain`.
- В producer закреплено, что `level-labs` не являются долгосрочной целевой моделью.
- В producer описано, что уходит, что переносится и что можно удалять только после замены.
- В producer заданы критерии readiness для controlled dismantling level-модели.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `level-labs`
  - capability: `workflow`
  - capability: `workbench`
  - capability: `task`
  - scenario: producer фиксирует controlled transition away from `level-labs` и задаёт критерии допуска к демонтажу level-модели.
- Уровень проверки: `static/contract`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются на уровне producer-change.
- Live credentials: не требуются на уровне producer-change.

## Why

Текущий `dispatcher-workbench` уже нормализует сущность верстака, но следующая волна больше не сводится к локальному развитию одного лабораторного экрана. Нужно отдельно закрепить producer-рамку, которая ответит на более крупные вопросы:

- должен ли Workbench стать главной рабочей поверхностью продукта;
- как он заменяет лабораторный UX, а не сосуществует с ним бесконечно;
- как в Workbench проявляются `project`, `task`, `workflow` и артефакты;
- какие downstream changes являются foundation, а какие — только частными UI/runtime-улучшениями.

Без этого `dispatcher-workbench` рискует остаться тактическим backlog-слоем вокруг lab-экрана, а не owner-линией следующего рабочего контура системы.

## What Changes

- Создаётся `producer-workbench` под `focus-domain`.
- Producer фиксирует Workbench как целевую главную рабочую поверхность продукта:
  - Workbench открывает и удерживает работу пользователя;
  - Workbench принимает на себя роль текущего лабораторного экрана;
  - Workbench должен быть связан с `project`, `task`, `workflow` и артефактами как с first-class сущностями.
- Producer описывает схему следующего контура:
  - `project` задаёт рабочий контекст;
  - `task` задаёт цель и набор артефактов;
  - `workflow` задаёт путь выполнения;
  - `workbench` materializes конкретный шаг или рабочую фазу этого пути.
- Producer явно закрепляет, что отказ от `level-labs` должен идти через новый workbench-контур, а не через косметический rename.
- Producer передаёт tactical ownership существующему `dispatcher-workbench`.
- Producer задаёт критерии readiness для следующих implementation waves:
  - понятен целевой user-facing смысл Workbench;
  - понятна связь Workbench ↔ Workflow ↔ Task ↔ Project;
  - понятны границы между foundation, runtime и UX waves;
  - `level-labs` больше не считаются долгосрочной целевой моделью.

## Non-goals

- Не реализовывать новый Workbench кодом в рамках producer-change.
- Не определять сразу весь набор Workbench tool families до конца.
- Не проектировать детально первый конкретный workflow внутри этого change.

## Capabilities

### Potentially Modified Capabilities
- `workbench`
- `workbench-tools`
- `workflow`
- `level-labs`
- `projects`

## Impact

- `focus-domain` получает producer-линию для следующей workbench-модели.
- `dispatcher-workbench` получает явного producer owner и перестаёт быть только исследовательским backlog вокруг lab-экрана.
- Downstream changes смогут разделять:
  - foundation-изменения Workbench;
  - переход away from `level-labs`;
  - runtime/preview/tooling waves;
  - workflow-specific implementation slices.

## Acceptance Criteria

- В active OpenSpec есть `producer-workbench` под `focus-domain`.
- В producer закреплено, что Workbench является целевой главной рабочей поверхностью продукта.
- В producer описана схема `project -> task -> workflow -> workbench`.
- В producer зафиксировано, что `level-labs` не являются долгосрочной целевой моделью.
- В producer заданы критерии readiness для следующих behavior-change waves.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `workbench`
  - capability: `workflow`
  - capability: `level-labs`
  - capability: `projects`
  - scenario: producer закрепляет Workbench как целевую рабочую поверхность и задаёт переход от лабораторной модели к workflow-driven контуру.
- Уровень проверки: `static/contract`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются на уровне producer-change.
- Live credentials: не требуются на уровне producer-change.

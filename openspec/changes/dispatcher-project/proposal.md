## Why

`producer-project` уже зафиксировал, что `Project` должен стать новым верхним контекстом продукта. Но одного producer-change недостаточно, чтобы вести эту линию как живой operational backlog:

- нужна точка, куда привязывать concrete `implement-*` и `fix-*` ветки;
- нужно удерживать границы между `Project Workspace`, task binding, workflow binding, workbench binding и тяжёлой миграцией `UI kit`;
- нужно не дать project-линии снова расползтись между `dispatcher-ui-kit`, runtime-ветками и будущими интеграциями `LLM` / `Figma` / `Git`.

Нужен отдельный dispatcher под `focus-domain`, который сделает `Project` постоянной тактической delivery-линией, а не только продуктовой идеей или producer-рамкой.

## What Changes

- Вводится `dispatcher-project` как постоянный tactical owner project-линии под `focus-domain`.
- Dispatcher фиксирует свою зону ответственности:
  - canonical `ProjectWorkspace`;
  - project registry и active project context;
  - отдельный onboarding/task layer внутри project context;
  - отдельный workflow layer как процесс решения внутри project context;
  - отдельный `workbench` / preview binding внутри project contract;
  - правила тяжёлой migration-операции при смене project `UI kit`;
  - дальнейшую маршрутизацию project-facing `implement-*` / `fix-*` changes на последовательных волнах.
- Dispatcher явно работает в связке с `producer-project` и сверяется с `producer-architecture-transform`, чтобы project entity оставалась читаемой architectural boundary, а не частным UI-state.

## Non-goals

- Не реализует runtime behavior сам по себе.
- Не подменяет собой `producer-project` и не переоткрывает его продуктовые решения.
- Не забирает ownership у соседних линий вроде `dispatcher-ui-kit` или `dispatcher-workbench`, если change меняет прежде всего их собственные контракты, а не project boundary.
- Не вводит `Project Roadmap` в первую волну.

## Capabilities

### Modified Capabilities

- `projects`: появляется постоянный tactical owner project-линии.
- `task`: project-aware onboarding/task changes получают явного родителя.
- `workflow`: project-scoped workflow semantics получают отдельного tactical owner как process-layer.
- `workbench`: project-scoped workbench binding получает явного родителя и следует после workflow-layer.
- `testing-layer`: downstream behavior-change changes линии обязаны явно описывать verification layer, команды и traceability.

## Impact

- `focus-domain` получает отдельный dispatcher для project-линии, а не размазывает её между чужими контурами.
- Downstream changes получают понятного долговременного tactical parent для entity/storage, onboarding/task layer, workflow-layer, `workbench` / preview binding, progress invalidation и следующих project-scoped волн.
- Архитектурная трансформация продукта начинает проявляться не только в `focus-tech`, но и в доменной topology через читаемую project boundary.

## Acceptance Criteria

- `dispatcher-project` отображается в дереве OpenSpec как активный dispatcher под `focus-domain`.
- Его producer-контекст явно считывается из той же domain-линии, но не задаётся иерархическим parentage.
- У dispatcher есть понятная tactical зона ответственности: workspace boundary, onboarding/task layer, workflow-layer, `workbench` / preview binding и migration rules для project `UI kit`.
- Dispatcher достаточно описан, чтобы быть родителем для downstream `implement` и `fix` changes project-линии на последовательных волнах.

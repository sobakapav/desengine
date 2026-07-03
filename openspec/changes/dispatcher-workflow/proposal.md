## Why

После фиксации `producer-workflow` нужен tactical owner, который будет удерживать workflow как живую operating line, а не разовую producer-идею.

Нужен отдельный dispatcher, который:

- держит operational backlog workflow-линии;
- развивает definition/instance модель;
- удерживает user-facing проявление шагов, фаз и переходов;
- маршрутизирует downstream `implement-*` / `fix-*` changes;
- не даёт workflow снова раствориться в `level-labs` или ad-hoc component screens.

## What Changes

- Создаётся `dispatcher-workflow` как tactical owner workflow-линии в `focus-domain`.
- Dispatcher фиксирует свою зону ответственности:
  - `WorkflowDefinition`, `WorkflowInstance`, `WorkflowStep`;
  - sequencing и переходы;
  - user-facing language шагов и фаз;
  - связь workflow с subject, artifacts и Workbench;
  - routing downstream implementation changes.
- Dispatcher работает в той же focus-линии, что и `producer-workflow`, и использует producer-контекст как содержательный pressure, а не как parentage.

## Non-goals

- Не заменяет producer и не дублирует его vision.
- Не реализует runtime behavior сам по себе.
- Не подменяет собой workbench-line или project-line.

## Capabilities

### Modified Capabilities

- `workflow`: появляется tactical dispatcher workflow-линии.
- `workbench`: workflow step materialization получает отдельный operational owner.
- `projects`: связь subject с workflow получает tactical ownership.
- `level-labs`: переход away from level-driven model получает operational tracking.

## Impact

- `focus-domain` получает отдельный dispatcher для workflow-линии.
- Downstream changes перестают смешивать process-модель, workbench-модель и legacy-level cleanup.

## Acceptance Criteria

- `dispatcher-workflow` отображается в дереве OpenSpec как активный dispatcher в `focus-domain`.
- Его producer-контекст явно считывается из той же domain-линии без иерархического parentage.
- У dispatcher есть понятная tactical зона ответственности: model, transitions, step manifestation и routing downstream changes.
- Dispatcher достаточно описан, чтобы быть parent для следующих workflow implementation waves.

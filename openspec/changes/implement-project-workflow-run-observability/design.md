## Контекст

- Проектная страница уже умеет показывать history diagnostics и read-only workflow readout.
- Текущий readout слишком плоский: он показывает current workflow step, но сам `workflow-run` ещё не читается как project-facing сущность с динамикой, пунктами и последней активностью.

## Решение

- Расширить project workflow readout до run-observability surface:
  - статус run;
  - сводка по пунктам workflow;
  - последняя активность;
  - связь run с artifacts и Workbench.
- Не вводить отдельный редактор или orchestration-control: surface остаётся read-only.

## Границы

- Входит:
  - `lib/project/workflow-readout.ts`;
  - project-facing model/panel;
  - unit-покрытие project workflow surface.
- Не входит:
  - отдельный runtime storage для workflow runs;
  - управление run из project page;
  - новый event bus для observability.

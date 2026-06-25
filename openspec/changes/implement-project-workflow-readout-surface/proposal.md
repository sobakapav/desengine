## Why

Workflow и artifact слой уже несут `projectId`, current step и runtime bindings, а Workbench summary уже может показать минимальную связку `project -> task -> workflow step -> workbench`. Но пользователь ещё не видит workflow проекта как самостоятельный наблюдаемый слой:

- невозможно открыть project-level read-only workflow view;
- current step и project-aware artifacts спрятаны в runtime/model;
- связь между проектом, задачей, workflow step и Workbench есть, но почти не объясняется пользователю.

## What Changes

- Поднять на страницу проекта read-only workflow/artifact surface.
- Показать:
  - current workflow step;
  - project-aware artifacts;
  - runtime bindings между project, task, workflow step и Workbench.
- Не менять underlying orchestration и не превращать change в redesign workflow engine.

## Impact

- Пользователь сможет увидеть, что workflow уже является частью проекта, а не скрытым внутренним процессом.
- Следующие workflow-facing waves смогут развивать управление поверх уже проявленного read-only слоя.

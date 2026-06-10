# Release Note

## Что меняется для пользователя:

- Unit-контракты project-aware task runtime снова согласованы с текущими server и helper-сигнатурами.
- Repair закрывает локальные падения в task runtime test layer после project-aware архитектурной волны.

## Как это влияет на пользователя:

- Команда может снова проверять repair-срез project-aware task runtime отдельным unit-набором без ложных падений из-за устаревших моков и ожиданий.
- Ошибки no-op iterate, task screen data и reset helper contracts больше не маскируют реальное состояние runtime-логики.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/task-iterate-noop-feedback.test.ts test/unit/task-project-client-boundary.test.ts test/unit/task-screen-data.test.ts test/unit/task-server-runtime-mutations.test.ts`.
- Убедиться, что unit-слой проходит именно на project-aware сигнатурах и не требует отката product-логики project-wave.

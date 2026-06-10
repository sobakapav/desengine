## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- Project-aware волна уже изменила сигнатуры task runtime helpers: часть функций теперь принимает `project`, а `project-runtime-scope` читает дополнительные server exports.
- Текущая проблема локализована в unit-слое: runtime-контракты уже изменились, но часть тестовых boundary-моков и ожиданий осталась legacy.

## Решение

- Не пересматривать product/runtime semantics project-wave.
- Синхронизировать unit-контракты с фактическими project-aware сигнатурами:
  - добавить в моки server boundary недостающий `ensureParentDir`;
  - обновить ожидания helper tests там, где новый `project`-аргумент передаётся как третий или четвёртый параметр;
  - оставить `task-project-client-boundary` в роли smoke-среза client contract без переписывания runtime.
- Сузить `verification_command` до repair-набора unit-тестов, чтобы change честно декларировал свой proof surface и не маскировался общим `npm run test:unit`.

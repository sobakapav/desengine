## Контекст

- Workflow-пункт уже влияет на prompt guidance и hint, но generation всё ещё работает по всему editable-набору как по одной общей массе.
- Пользователю нужен не только explainability-фокус, а реальное управление тем, какой артефакт система сейчас генерирует.

## Решение

- Ввести `primary file set` для selected workflow-point.
- В `start` и `iterate` передавать в structured-output schema только целевые файлы выбранного workflow-пункта.
- Остальные editable-файлы оставлять supporting context, чтобы система не теряла целостность рендера, но и не подменяла фокус генерации.

## Границы

- Входит:
  - target file set для workflow-point;
  - изменение `start`/`iterate` behavior;
  - unit-тесты task action boundary.
- Не входит:
  - writable orchestration по project page;
  - управление check-flow по workflow-пунктам;
  - новая dependency model между артефактами.

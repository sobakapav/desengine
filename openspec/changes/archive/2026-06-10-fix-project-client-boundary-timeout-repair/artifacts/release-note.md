# Release Note

## Что меняется для пользователя:

- Узкий project-aware client boundary для open/start helpers больше не тянет тяжёлый `Workbench`/preview graph в unit-тестах.
- Поведение open/start с active project не меняется, меняется только import seam для test/runtime boundary.

## Как это влияет на пользователя:

- Команда снова может прогонять `task-project-client-boundary` без timeout в общем unit-контуре.
- Project-aware semantics не размываются: query/body по-прежнему несут active project, а fix не откатывает project-wave поведение.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/task-project-client-boundary.test.ts`.
- Убедиться, что набор завершается зелёно и не зависает на кейсе open/start helpers.

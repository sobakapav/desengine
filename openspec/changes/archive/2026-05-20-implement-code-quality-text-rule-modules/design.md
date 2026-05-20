## Решение

`engine.mjs` остаётся владельцем CLI, git scope, config, TypeScript program и waiver-применения. Правила получают минимальный контекст и возвращают нарушения единого формата:

- `file-length.mjs`: проверяет лимит строк файла;
- `todo-format.mjs`: проверяет формат TODO/FIXME;
- `function-length.mjs`: проверяет длину тела функций;
- `boolean-trap.mjs`: проверяет boolean-параметры экспортируемых API;
- `api-example.mjs`: проверяет `@example` у нетривиального экспортируемого API;
- `floating-promise.mjs`: проверяет необработанные Promise-вызовы.

## Ограничения

- Без сетевых вызовов.
- Без LLM в обязательном пути.
- Без изменения install-critical инфраструктуры.

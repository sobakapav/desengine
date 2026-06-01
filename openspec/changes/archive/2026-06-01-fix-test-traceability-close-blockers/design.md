## Контекст

Повторный `os:close` для `fix-codex-browser-verification-gate` показал, что собственная verification-команда change проходит, а архивирование режется на общем `npm run test:traceability`. Источник падения не один:

- browser test Safari ссылается на несуществующий `task` scenario;
- unit test start payload ссылается на requirement `component-file-set`, а не на конкретный scenario;
- в `level-labs` остался один непокрытый scenario про rehydration project settings.

## Решение

1. Не трогать product runtime и не расширять scope до unrelated fixes.
2. Исправить только traceability-источники:
   - `test/e2e/safari-task-runtime-instability.spec.ts`;
   - `test/unit/task-start-llm.test.ts`;
   - `test/unit/project-ui-kit-switching.test.ts` или эквивалентный покрывающий файл.
3. Использовать `npm run test:traceability` как главный проверочный контур change.

## Риски

- Если подменить проблему coverage-plan записью вместо реального покрытия, active `level-labs` traceability снова станет неполной.
- Если переименовать scenario без сверки со spec, можно убрать одну ошибку и создать другую.

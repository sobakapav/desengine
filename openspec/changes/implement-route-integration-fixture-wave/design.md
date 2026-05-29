## Контекст

- В коде уже есть несколько route handlers, где логика склейки заметно богаче unit-only уровня:
  - auth/access guard;
  - parsing `Request` и async `params`;
  - response mapping в статус-коды и JSON contract;
  - вызовы runtime/service boundary;
  - работа с env-aware статусами и onboarding/system actions.
- Сейчас эта склейка в основном проверяется source-contract тестами и частично e2e smoke, но между ними нет отдельного integration слоя.

## Решение

- Использовать foundation runner из `implement-integration-test-runner-foundation`.
- В первой волне сфокусироваться на сценариях, где integration даёт максимальную добавочную ценность:
  - task routes: happy path, invalid body, not found, unauthorized, response mapping;
  - llm status route: единый endpoint и корректный JSON contract;
  - onboarding update route: success/error mapping без реального git/network side effect.
- Предпочитать real route handler + stubbed runtime/service dependencies, а не повторную проверку чистых функций.
- Для task routes использовать temp/fixture user-state или полностью stubbed storage boundary так, чтобы тест не трогал рабочий `user/`.

## Не берём в эту волну

- browser navigation и route rendering;
- real provider calls;
- `test:full` promotion;
- отдельную wave по auth verify и `/api/system/update`, пока не решено, как лучше привязать их к active capability scenarios без искусственного расширения текущего объёма.

## Риски и компромиссы

- Риск: suite станет слишком широкой и потеряет фокус.
  - Митигация: первая волна закрывает только route contracts с уже очевидной spec traceability.

- Риск: task route integration начнёт повторять существующие service boundary unit-тесты.
  - Митигация: проверять именно HTTP boundary и orchestration-склейку.

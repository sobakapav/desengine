## Tasks

- [x] 1. Локализовать все текущие traceability-blockers, которые мешают `os:close` дочерних test-system fixes.
- [x] 2. Исправить неверную scenario-ссылку в `test/e2e/safari-task-runtime-instability.spec.ts`.
- [x] 3. Исправить неверную scenario-ссылку в `test/unit/task-start-llm.test.ts`.
- [x] 4. Закрыть непокрытый `level-labs` scenario про rehydration project settings через существующий покрывающий тест.
- [x] 5. Подтвердить, что `npm run test:traceability` проходит без coverage-plan workaround для этих трёх случаев.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `task` / `Preview поднимает runtime-ошибку Sandpack в host UI`
  - `llm` / `Система выполняет start`
  - `task` / `Пользователь запускает уровень через service boundary`
  - `level-labs` / `Лаборатория переводит локальные project settings на shadcn/ui при rehydration`
- Уровень проверки: static/contract
- Команда проверки:
  - `npm run test:traceability`
- Mock/fixture-данные и credentials:
  - не нужны; change исправляет `@openSpec` metadata и coverage test links.

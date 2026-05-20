# Tasks

- [x] 1. Обновить OpenSpec контракт
  - [x] 1.1 `openspec/specs/task-levels/spec.md`: зафиксировать правило принудительного `maxLevel = 3`.
- [x] 2. Реализация
  - [x] 2.1 `lib/task/server.ts`: принудительно выставлять `maxLevel = 3` при чтении task config.
- [x] 3. Тестирование change
  - [x] 3.1 Затронутые capability/scenarios:
    - `task-levels` / "Система читает метаданные задачи"
    - `task-levels` / "Система нормализует maxLevel задачи"
  - [x] 3.2 Уровень проверки: static/contract (unit)
  - [x] 3.3 Команда: `npm run test:unit`
  - [x] 3.4 Проверка: source-contract тест фиксирует `FORCED_TASK_MAX_LEVEL = 3` в `lib/task/server.ts` (`test/unit/p1-source-contracts.test.ts`).

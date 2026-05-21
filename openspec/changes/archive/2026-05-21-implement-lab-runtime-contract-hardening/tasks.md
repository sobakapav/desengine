## Tasks

- [x] 1. Зафиксировать canonical route map lab/task flow:
  - [x] 1.1 Найти все helper-функции и route/page usage для `/lab`, `/tasks`, check/done/next.
  - [x] 1.2 Ввести или уточнить единый runtime helper для canonical URL.
  - [x] 1.3 Добавить unit/source-contract тесты на canonical routes и legacy redirects.
- [x] 2. Ввести reusable empty `TaskData` factory:
  - [x] 2.1 Найти все дубли `createEmptyTaskData`.
    - Найдены и переведены дубли в `app/lab/[taskId]/page.tsx`, `app/lab/[taskId]/[screen]/page.tsx`, `app/api/tasks/[taskId]/route.ts`, `app/api/tasks/[taskId]/check/route.ts`, `app/api/tasks/[taskId]/reset/route.ts`, `app/tasks/[taskId]/check/page.tsx` и e2e demo.
  - [x] 2.2 Вынести factory в доменный runtime слой.
  - [x] 2.3 Перевести route/page/API usage на factory.
  - [x] 2.4 Добавить unit-тест на shape.
- [x] 3. Выделить application service boundary для lab actions:
  - [x] 3.1 Спроектировать service-функции для `start`, `iterate`, `check`, `save files`, `reset`.
  - [x] 3.2 Перенести core logic из route handlers без изменения HTTP response contract для `POST /api/tasks/:taskId/start`, `POST /api/tasks/:taskId/iterate`, `POST /api/tasks/:taskId/check`, `POST /api/tasks/:taskId/files` и `POST /api/tasks/:taskId/reset`.
  - [x] 3.3 Добавить unit/service тесты на поведение с mock/fixtures для `startTaskLevel`, `iterateTaskLevel`, `checkTaskLevel`, `saveTaskFiles` и `resetTaskRuntime`.
- [x] 4. Добавить минимальную per-task mutation boundary:
  - [x] 4.1 Реализовать последовательное выполнение мутаций по `taskId`.
  - [x] 4.2 Применить boundary к безопасным lab action mutations: сохранение рабочих файлов и reset runtime.
  - [x] 4.3 Добавить unit-тест на сериализацию same-task мутаций и concurrency для разных `taskId`.
- [x] 5. Добавить lab-flow проверку без live credentials:
  - [x] 5.1 Уровень проверки: unit/service с mock LLM и полностью замоканным service boundary; e2e smoke не добавлялся в этом change, чтобы не стабилизировать browser/runtime поверх параллельных изменений.
  - [x] 5.2 Использовать mock LLM/fixture task, level, lab context, user state и file writes.
  - [x] 5.3 Команда запуска: `npm run test:unit -- test/unit/task-actions-boundary.test.ts`.
- [x] 6. Проверки и traceability:
  - [x] 6.1 Обновить OpenSpec metadata в тестах для затронутых scenarios.
  - [x] 6.2 Запустить `npm run test:unit`.
  - [x] 6.3 Запустить `npm run test:traceability` или зафиксировать unrelated blocker.
    - `npm run test:traceability` проходит; новые `level-labs`, `task` и `testing-layer` scenarios covered.
  - [x] 6.4 E2E smoke не добавлялся: обязательное покрытие change закрыто service-level проверкой без live credentials, `npm run test:e2e` для этого change не требуется.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `level-labs`, `task`, `iteration`, `testing-layer`.
- [x] Выбрать уровень проверки: unit/contract + integration/service; e2e smoke при стабильной реализации без live credentials.
- [x] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команды проверки: `npm run test:unit`, `npm run test:traceability`, при e2e `npm run test:e2e`.
- [x] Описать mock/fixture-данные: mock LLM, temp user storage, fixture task/level data; live credentials не нужны.
- [x] Покрытие не откладывается: lab-flow закрыт service-level mock проверкой; отдельная запись в `test/traceability/coverage-plan.json` не требуется.

## Tasks

- [x] 1. Зафиксировать первую integration wave и её привязку к active specs.
- [x] 2. Добавить integration-сценарии для task API route handlers на fixture runtime.
- [x] 3. Добавить integration-сценарий для `GET /api/status/llm`.
- [x] 4. Добавить integration-сценарий для `POST /api/onboarding/update`.
- [x] 5. Обновить traceability metadata и документацию там, где это требуется для новой integration wave.
- [x] 6. Подготовить change к внешней проверке по `verification_command`.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `task` / `Пользователь запускает уровень через service boundary`
  - `task` / `Пользователь уточняет задачу через service boundary`
  - `task` / `Пользователь проверяет результат через service boundary`
  - `task` / `Пользователь сохраняет рабочие файлы`
  - `task` / `Пользователь сбрасывает задачу через service boundary`
  - `task` / `Route handlers используют переиспользуемые lab action services`
  - `iteration` / `Пользователь запускает уточняющий промпт`
  - `iteration` / `Пользователь сбрасывает задачу`
  - `llm` / `Клиент запрашивает статус LLM`
  - `onboarding-repo` / `Пользователь хочет повторно обновить onboarding-контент`
  - `testing-layer` / `Integration-слой покрывает route handlers через fixture boundary`
- Уровень проверки: integration.
- Ожидаемые тесты: `test/integration/**/*.test.ts` для task routes, LLM status и onboarding update.
- Команда запуска: `npm run test:integration`
- Mock/fixture-данные: fixture requests, stubbed runtime/service dependencies, temp user-state; live credentials и реальные network-вызовы не нужны.
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем.

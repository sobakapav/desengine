## Tasks

- [x] 1. Снять список LLM size waivers.
- [x] 2. Декомпозировать `lib/llm/server.ts` на внутренние modules.
- [x] 3. Удалить снятые waivers.
- [x] 4. Проверить `npm run quality:text:repo`, `npm run test:unit`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text`, `llm`, provider capabilities.
- [x] Уровень проверки: static/contract + unit.
- [x] Команды запуска: `npm run quality:text:repo`, `npm run test:unit`.
- [x] Mock/fixture-данные: существующие provider mocks; live credentials не нужны.

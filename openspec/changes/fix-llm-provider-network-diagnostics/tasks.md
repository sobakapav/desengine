## Tasks

- [ ] 1. Локализовать provider-specific drift между runtime adapters и `llm-network`.
- [ ] 2. Ввести корректную probe-definition для `openai`, `deepseek`, `gemini`, `claude`, `zai`.
- [ ] 3. Убрать fallback на `OPENAI_API_KEY` вне OpenAI-compatible probe.
- [ ] 4. Добавить unit coverage для provider-aware resource diagnostics.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `llm`: диагностика показывает статус LLM-конфигурации.
- `resource-status`: диагностика собирает ресурс через общий resolver.
- `claude`: оператор выбирает Claude.
- `zai`: оператор выбирает Z.AI.

Уровни проверки:
- unit: обязательный.

Команды запуска:
- `npm run test:unit -- test/unit/resource-status.test.ts`
- `npm run test:unit -- test/unit/llm.server.claude.test.ts`
- `npm run test:unit -- test/unit/llm.server.zai.test.ts`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- используются unit-mocks provider fetch и synthetic resource-status values.

## Tasks

- [ ] 1. Ввести bounded timeout contract для `iterate` и `check`.
- [ ] 2. Протянуть timeout в user-facing error handling без потери task state.
- [ ] 3. Убедиться, что workbench UI снимает pending и позволяет повторить запрос.
- [ ] 4. Добавить browser/e2e или equivalent coverage на timeout feedback.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `iteration`: провайдер вернул ошибку; ошибка итерации не разрушает текущее состояние.
- `llm`: ошибки LLM-провайдера объясняются пользователю; таймауты.

Уровни проверки:
- component/browser: обязательный.
- unit: желателен для runtime timeout policy.

Команды запуска:
- `npm run test:e2e -- test/e2e/iterate-timeout-feedback.spec.ts`
- `npm run test:unit -- test/unit/llm.server.test.ts`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- browser/e2e должен использовать mock provider timeout или controlled hanging endpoint.

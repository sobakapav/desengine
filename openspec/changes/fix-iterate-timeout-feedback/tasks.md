## Tasks

- [x] 1. Ввести bounded timeout contract для `iterate` и `check`.
- [x] 2. Протянуть timeout в user-facing error handling без потери task state.
- [x] 3. Убедиться, что workbench UI снимает pending и позволяет повторить запрос.
- [x] 4. Добавить browser/e2e или equivalent coverage на timeout feedback.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `iteration`: провайдер вернул ошибку; ошибка итерации не разрушает текущее состояние.
- `llm`: ошибки LLM-провайдера объясняются пользователю; таймауты.

Уровни проверки:
- component/browser: обязательный.
- unit: желателен для runtime timeout policy.

Команды запуска:
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/iterate-timeout-feedback.spec.ts`
- `npm run test:unit -- test/unit/iterate-timeout-feedback.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- browser/e2e использует fixture-доступ и controlled hanging endpoint через `page.route(...)`, без live LLM.

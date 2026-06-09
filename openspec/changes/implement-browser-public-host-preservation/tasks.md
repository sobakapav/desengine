## Tasks

- [ ] 1. Зафиксировать browser/dev wrapper contract для public host/domain и localhost fallback.
- [ ] 2. Развести bind-host и public base URL в runtime/browser tooling.
- [ ] 3. Убрать неявную подмену публичного host/domain на localhost без явного opt-in.
- [ ] 4. Обновить browser verification tests и документацию запуска.
- [ ] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: browser verification использует корректный public base URL.
- `admin-tools`: verification path не путает системную неготовность browser phase и host normalization bug.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для normalization/base-url helper logic.
- component/browser: обязателен для wrapper/runtime path.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`

Mock/fixture-данные и credentials:
- fixture-данные не должны требовать live credentials;
- public host/domain должен проверяться без изменения product auth flow.

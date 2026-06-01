## Tasks

- [x] 1. Локализовать recurring `SIGABRT/kill EPERM` как execution-mode defect, а не product verdict.
- [x] 2. Ввести явный Codex seatbelt gate для прямого browser/e2e запуска без wrapper.
- [x] 3. Сделать wrapper каноническим browser verification path и стабилизировать его на `chromium`.
- [x] 4. Научить `os:close` автоматически использовать wrapper для `component/browser` verification-command.
- [x] 5. Обновить docs/testing-layer, test/README и tools/README под новый контракт.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: разработчик запускает browser verification preflight.
- `testing-layer`: разработчик запускает полный локальный тестовый слой.

Уровни проверки:
- unit: обязательный.
- component/browser: желателен как внешний smoke самого wrapper-path.

Команды запуска:
- `npm run test:unit -- test/unit/browser-verification-runtime.test.ts test/unit/p2-source-contracts.test.ts`
- `npm run test:traceability`
- `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- wrapper smoke использует локальный target server и browser preflight без provider-секретов.

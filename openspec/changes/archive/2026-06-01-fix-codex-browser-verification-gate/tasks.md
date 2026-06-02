## Tasks

- [x] 1. Локализовать recurring `SIGABRT/kill EPERM` как execution-mode defect, а не product verdict.
- [x] 2. Ввести явный Codex seatbelt gate для прямого browser/e2e запуска без wrapper.
- [x] 3. Сделать wrapper каноническим browser verification path и стабилизировать его на `chromium`.
- [x] 4. Научить `os:close` автоматически использовать wrapper для `component/browser` verification-command.
- [x] 5. Синхронизировать OpenSpec и документацию под новый контракт.
  - [x] 5.1 Обновить `docs/testing-layer.md`, `test/README.md` и `tools/README.md`.
  - [x] 5.2 Добавить delta-specs для `testing-layer` и `admin-tools` в active change.
- [x] 6. Привязать change к реальным blocker-кейсам.
  - [x] 6.1 `fix-sandpack-tailwind-preview-pipeline`
  - [x] 6.2 `fix-iterate-timeout-feedback`
  - [x] 6.3 `fix-workbench-context-visibility`
  - [x] 6.4 без валидного preflight downstream browser-fix нельзя закрывать через `os:close`

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: разработчик запускает browser verification preflight.
- `testing-layer`: разработчик запускает полный локальный тестовый слой.
- `admin-tools`: browser-fix не закрывается без валидного preflight.

Уровни проверки:
- unit: обязательный.
- component/browser: желателен как внешний smoke самого wrapper-path.

Команды запуска:
- `npm run test:unit -- test/unit/browser-verification-runtime.test.ts test/unit/p2-source-contracts.test.ts`
- `npm run test:traceability`
- `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- wrapper smoke использует локальный target server и browser preflight без provider-секретов;
- если coverage пришлось бы откладывать, это нужно было бы явно зафиксировать в `test/traceability/coverage-plan.json`, но для этого change defer не планируется.

## Tasks

- [x] 1. Зафиксировать contract browser verification modes.
  - [x] 1.1 Явно описать и реализовать штатный `webServer` path.
  - [x] 1.2 Явно описать и реализовать канонический `external server` fallback через `DESENGINE_E2E_EXTERNAL_SERVER=1` и `DESENGINE_E2E_BASE_URL`.
- [x] 2. Добавить browser verification preflight/smoke, который отделяет infra failure от product verdict.
  - [x] 2.1 Проверить доступность target server до продуктового сценария.
  - [x] 2.2 Проверить запуск Chromium и открытие базового route.
  - [x] 2.3 Классифицировать `bind`, `launch`, `base URL` и route-level failures понятными diagnostics.
- [x] 3. Ужесточить правила приёмки downstream browser-fix changes.
  - [x] 3.1 Зафиксировать, что невалидный preflight блокирует `os:close` для fixes с обязательной browser-приёмкой.
  - [x] 3.2 Зафиксировать, что unit/static green не заменяет browser verdict для таких changes.
- [x] 4. Обновить тестовую и операционную документацию test-system.
  - [x] 4.1 `docs/testing-layer.md`
  - [x] 4.2 `test/README.md`
  - [x] 4.3 при необходимости `playwright.e2e.config.ts` source-contract tests / coverage-plan
- [x] 5. Привязать change к реальным blocker-кейсам.
  - [x] 5.1 `fix-sandpack-tailwind-preview-pipeline`
  - [x] 5.2 `fix-iterate-timeout-feedback`
  - [x] 5.3 `fix-workbench-context-visibility`

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: единый тестовый слой должен иметь воспроизводимую browser/e2e проверку без смешения product bugs и infra failures.
- `testing-layer`: обязательные тесты воспроизводимы без внешних секретов.
- `testing-layer`: развитие тестового слоя не блокирует runtime, но browser verification должна оставаться честной и runnable.

Уровни проверки:
- static/contract: обязательный.
- unit: желателен для config/env/diagnostics guardrails.
- e2e smoke: обязательный.
- component/browser: допустим как дополняющий слой, если часть preflight выносится в browser harness.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- test/unit/p2-source-contracts.test.ts`
- `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`
- `DESENGINE_E2E_EXTERNAL_SERVER=1 DESENGINE_E2E_BASE_URL=http://127.0.0.1:3410 npm run test:e2e -- test/e2e/browser-verification-runtime.spec.ts` как fallback path

Mock/fixture-данные и credentials:
- live/provider credentials не нужны;
- browser smoke должен работать на локальном target server без реальных LLM ключей;
- если нужен внешний сервер, он должен быть локально поднят и явно указан через `DESENGINE_E2E_BASE_URL`.

Если покрытие откладывается:
- если preflight/spec не появится в этом change, нужно добавить запись в `test/traceability/coverage-plan.json` с причиной, почему browser verification пока остаётся инфраструктурным риском, и с этапом закрытия.

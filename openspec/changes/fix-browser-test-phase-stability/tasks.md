## Tasks

- [ ] 1. Зафиксировать browser phase как системный verification contract.
  - [ ] 1.1 Определить обязательные фазы `target-ready`, `browser-ready`, `fixture-ready`, `product-run`, `cleanup`.
  - [ ] 1.2 Зафиксировать, какие фазы обязательны для валидного product verdict, а какие считаются post-run diagnostics.
- [ ] 2. Сделать phase-level diagnostics канонической частью browser verification runtime.
  - [ ] 2.1 Вернуть machine-readable классификацию причин падения.
  - [ ] 2.2 Развести infra/bootstrap/fixture/product/cleanup failures в человеко-понятном выводе.
- [ ] 3. Стабилизировать канонический wrapper-path как оркестратор browser-фазы.
  - [ ] 3.1 Уточнить правила, когда direct `npm run test:e2e -- ...` считается невалидным verification mode.
  - [ ] 3.2 Передавать product-spec выполнение только после завершения обязательных фаз готовности.
  - [ ] 3.3 Зафиксировать cleanup semantics, чтобы teardown failure не скрывал уже полученный product verdict.
- [ ] 4. Синхронизировать browser-phase contract с административными командами и документацией.
  - [ ] 4.1 Обновить `docs/testing-layer.md`.
  - [ ] 4.2 Обновить `test/README.md`.
  - [ ] 4.3 При необходимости обновить `tools/README.md` и close-path документацию.
  - [ ] 4.4 Зафиксировать guardrails для `npm run os:close -- <implement-or-fix-change>` с `verification_level=component/browser`.
- [ ] 5. Привязать change к общему тестовому слою и traceability.
  - [ ] 5.1 Добавить или обновить unit/static guards на browser-phase orchestration.
  - [ ] 5.2 Добавить runnable browser verification scenario для phase-level verdict.
  - [ ] 5.3 Если часть phase diagnostics нельзя закрыть сейчас, зафиксировать defer в `test/traceability/coverage-plan.json`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: browser verification даёт phase-level verdict и не смешивает bootstrap/browser/fixture/product/cleanup failures.
- `admin-tools`: browser-oriented close-path не принимает change без валидного прохождения обязательных browser phases.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: обязательный.
- integration: не требуется.
- e2e smoke: обязательный.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- test/unit/browser-verification-runtime.test.ts`
- `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`

Mock/fixture-данные и credentials:
- live/provider credentials не нужны;
- browser verification использует локальный target server, fixture access и mock/controlled project state;
- если нужен внешний server path, он задаётся локально через `DESENGINE_E2E_EXTERNAL_SERVER=1` и `DESENGINE_E2E_BASE_URL`.

Если покрытие откладывается:
- если phase-level diagnostics или runnable browser-phase scenario не удаётся закрыть в этом change целиком, нужно добавить запись в `test/traceability/coverage-plan.json` с объяснением незакрытой фазы и планом её закрытия.

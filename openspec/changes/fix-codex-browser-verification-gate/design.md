## Контекст

Проблема уже не в product-code и не в самом Playwright API. Диагностика показала:

- в Codex seatbelt (`CODEX_SANDBOX=seatbelt`) прямой `npm run test:e2e -- ...` регулярно падает на browser launch;
- тот же `browser-verification-runtime.spec.ts`, запущенный вне sandbox, проходит;
- значит recurring failure относится к execution mode, а не к browser spec как таковому.

Если это не закрепить на уровне tool contract, команда продолжит тратить время на ложные product-debug циклы.

## Решение

1. Вынести rule-level gate в `test/helpers/browser-verification.ts`:
   - seatbelt + direct Playwright run => немедленная понятная ошибка;
   - wrapper-run => допустимый path.
2. Использовать wrapper как канонический runner:
   - `DESENGINE_E2E_RUNNER=browser-wrapper`;
   - default browser channel `chromium`;
   - shell preflight + внешний browser path.
3. На уровне `os:close` автоматически переводить `component/browser` verification-command на wrapper, если metadata указывает прямой `npm run test:e2e -- test/e2e/*.spec.ts`.
4. Обновить docs/test contract, чтобы direct sandboxed run больше не считался нормальным browser verdict.

## Проверочный слой

- Затронутые capability/scenario:
  - `testing-layer` / запуск browser verification preflight;
  - `testing-layer` / запуск полного локального тестового слоя.
- Уровень проверки: `unit`.
- Команда:
  - `npm run test:unit -- test/unit/browser-verification-runtime.test.ts test/unit/p2-source-contracts.test.ts`
  - при необходимости внешний smoke:
    `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`

Unit-слой должен доказывать:

- default channel и wrapper-flag согласованы;
- Codex seatbelt без wrapper немедленно получает понятный gate;
- `os:close` знает про auto-wrap для `component/browser` changes;
- docs и tool contracts описывают именно wrapper-path, а не старый direct-run.

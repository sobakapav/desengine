## Миссия

- Что должен изменить этот change: убрать recurring false blocker, в котором Codex seatbelt запускает прямой browser/e2e path, получает `SIGABRT`/`kill EPERM` до открытия страницы и выдаёт это за product failure.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: test-system уже отделил product fixes от infra/runtime проблем browser verification и требует честного preflight перед `component/browser` verdict.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-test-system`; этот fix отвечает за Codex-seatbelt gate, wrapper-runner и auto-wrap в `os:close`.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/specs/testing-layer/spec.md
- docs/testing-layer.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-codex-browser-verification-gate: `test/README.md`, `test/helpers/browser-verification.ts`, `playwright.e2e.config.ts`, `tools/testing/run-browser-verification-runtime.mjs`, `tools/openspec-close-change.mjs`, `test/unit/browser-verification-runtime.test.ts`.

## Границы исполнения

- Что входит в этот change: явный guard против direct browser/e2e launch в Codex seatbelt; канонический wrapper-path для browser verification; перевод `os:close` на wrapper для `component/browser` verification-command; синхронизация docs/tooling.
- Что сознательно не входит в этот change: исправление конкретных product e2e specs, смена Playwright на другой стек, ослабление browser-приёмки до unit-only.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: browser verdict остаётся обязательным для соответствующих fixes; change укрепляет путь запуска, а не отменяет browser-layer.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/browser-verification-runtime.test.ts test/unit/p2-source-contracts.test.ts
- Что именно должен доказать результат проверки: Codex seatbelt без wrapper больше не доходит до ложного browser launch; wrapper-path закреплён как канонический; `os:close` умеет auto-wrap для `component/browser`; docs не оставляют direct sandboxed run как будто бы нормальный verification mode.

## Что реализовано

- В `test/helpers/browser-verification.ts` добавлен явный Codex seatbelt gate и helper `getWrapperRunnerCommand(...)`.
- `playwright.e2e.config.ts` теперь прерывает прямой browser/e2e запуск в Codex seatbelt до старта Playwright browser process и печатает каноническую wrapper-команду.
- `tools/testing/run-browser-verification-runtime.mjs` переведён на default `chromium` и всегда пробрасывает `DESENGINE_E2E_RUNNER=browser-wrapper`.
- `tools/openspec-close-change.mjs` больше не полагается на прямой `npm run test:e2e -- test/e2e/*.spec.ts` для `component/browser`: preflight и verification auto-wrapятся в wrapper-path.
- Обновлены `docs/testing-layer.md`, `test/README.md`, `tools/README.md`.
- Обновлён unit-layer `test/unit/browser-verification-runtime.test.ts` под новый контракт.

## Проверено в рабочей сессии

- Внешний diagnostic matrix вне sandbox:
  - `DESENGINE_E2E_EXTERNAL_SERVER=1 DESENGINE_E2E_BASE_URL=http://127.0.0.1:3410 npm run test:e2e -- test/e2e/browser-verification-runtime.spec.ts`
  - `PLAYWRIGHT_BROWSER_CHANNEL=chromium DESENGINE_E2E_EXTERNAL_SERVER=1 DESENGINE_E2E_BASE_URL=http://127.0.0.1:3410 npm run test:e2e -- test/e2e/browser-verification-runtime.spec.ts`
  - browser preflight проходит, значит recurring `SIGABRT` относится к sandboxed direct-run path, а не к самому product/browser runtime.

## Открытые вопросы

- Нужно ли позже перевести активные `component/browser` fixes на явные wrapper-команды прямо в их metadata/handoff, а не полагаться только на auto-wrap в `os:close`.

## Why

Повторяется один и тот же ложный blocker: browser/e2e запуск из Codex `CODEX_SANDBOX=seatbelt` доходит до `browserType.launch`, затем Chromium/Chrome падает на `SIGABRT`, а процесс очистки даёт `kill EPERM`. Это не product verdict, но downstream fixes снова и снова выглядят как “не прошли browser-приёмку”.

Сейчас в системе есть `tools/testing/run-browser-verification-runtime.mjs`, но он не стал единственным каноническим входом. В результате:

- прямой `npm run test:e2e -- ...` продолжает использоваться как будто это валидный browser verdict;
- `os:close` для browser-oriented fixes и direct `component/browser` verification-command тоже может идти через прямой Playwright path;
- документация всё ещё допускает запуск, который в Codex seatbelt системно даёт ложный сбой.

## What Changes

- Ввести явный gate в Playwright config/runtime: в Codex seatbelt прямой `npm run test:e2e` не должен запускать browser verification без wrapper.
- Сделать `tools/testing/run-browser-verification-runtime.mjs` каноническим путём для browser verification в Codex и стабилизировать его на bundled `chromium`.
- Научить `os:close` автоматически переводить direct `component/browser` verification-command на wrapper-path вместо прямого `npm run test:e2e -- test/e2e/*.spec.ts`, а для `fix` с `verification_level=component/browser` сначала выполнять обязательный preflight.
- Обновить документацию testing-layer и test/README так, чтобы sandboxed direct-run больше не выглядел допустимым verification mode.

## Non-goals

- Не менять сам стек Playwright на другой инструмент.
- Не чинить конкретные product-specs (`sandpack`, `workbench`, `iterate`) в этом change.
- Не ослаблять требование browser-приёмки для downstream fixes.

## Impact

- Ложные `SIGABRT/kill EPERM` перестанут маскироваться под product bugs.
- У browser verification появится один канонический запускной контракт для Codex.
- `component/browser` fixes будет проще честно закрывать, а direct browser verification-command труднее ложно блокировать неподходящим execution mode.

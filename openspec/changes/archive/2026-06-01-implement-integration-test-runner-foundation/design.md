## Контекст

- `package.json` держит `test:integration` как placeholder через `tools/testing/pending-layer.mjs`.
- `vitest.config.ts` уже содержит unit и storybook projects, но отдельного integration project нет.
- В `app/api/**/route.ts` лежит достаточно boundary-кода, который уже не unit-only, но ещё не требует браузера: auth guard, params/body parsing, response mapping, env/runtime orchestration.

## Решение

- Добавить отдельный Vitest project `integration` в `node`-окружении.
- Сделать `npm run test:integration` канонической командой запуска этого project.
- Ввести shared integration helpers:
  - вызов route handler с `Request` и async `params`;
  - безопасный разбор `Response` и HTTP contract assertions;
  - фикстурный env/runtime setup без live secrets;
  - temp user-state helpers для сценариев, где route пишет task data или progress.
- Явно удержать границу слоёв:
  - unit: чистая доменная логика и source-contract;
  - integration: route/API + auth/env/runtime boundary без браузера;
  - e2e smoke: маршруты и пользовательская навигация в браузере.

## Non-goals

- Не менять install-critical стек, bundler или стратегию запуска `next dev`.
- Не добавлять integration в `test:full`, пока не стабилизируется первый runnable набор.
- Не пытаться этим runner'ом закрыть live/provider сценарии.

## Риски и компромиссы

- Риск: integration начнёт дублировать unit-тесты один в один.
  - Митигация: проверять только boundary-склейку route/auth/request/response/runtime, а не внутренние чистые функции.

- Риск: integration станет скрытым e2e и начнёт тянуть browser/dev-server.
  - Митигация: прямой импорт route handlers, `node`-окружение и явный запрет на browser/network.

- Риск: запись во временное пользовательское состояние начнёт течь в рабочий `user/`.
  - Митигация: использовать temp roots или полностью fixture-based storage boundary.

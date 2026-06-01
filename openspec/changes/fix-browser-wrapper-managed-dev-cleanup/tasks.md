## Tasks

- [x] 1. Подтвердить, что wrapper может оставлять живой managed `next dev` и ломать следующий browser verification run.
- [x] 2. Перевести запуск managed server на прямой `node`-entrypoint без shell shim.
- [x] 3. Добавить явный cleanup/ожидание завершения child process после wrapper-run.
- [x] 4. Закрепить regression-guard на source-contract уровне.
- [ ] 5. Повторить `npm run os:close -- fix-level-3-description-visibility` и убедиться, что close-path больше не падает на остаточном `next dev`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: `Разработчик запускает browser verification preflight`
- `admin-tools`: `Browser-fix в Codex seatbelt закрывается через канонический wrapper-path`

Уровни проверки:
- unit: обязательный
- component/browser: допустим как внешний confirm, если нужно перепроверить `os:close`

Команды запуска:
- `npm run test:unit -- test/unit/browser-verification-runtime.test.ts`
- `npm run os:close -- fix-level-3-description-visibility`

Mock/fixture-данные и credentials:
- unit-слой не требует live credentials;
- повтор `os:close` использует локальный browser wrapper path и fixture-доступ browser-fix, который уже задан в metadata закрываемого change.

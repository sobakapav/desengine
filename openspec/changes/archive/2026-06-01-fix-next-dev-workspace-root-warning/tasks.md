## Tasks

- [x] 1. Подтвердить воспроизводимость warning при нескольких lockfile вокруг каталога приложения.
- [x] 2. Явно закрепить канонический root в `next.config.ts` без изменения install-critical стека.
- [x] 3. Добавить regression-guard на итоговый config shape и на fix-path, который должен предотвращать ложный root-warning.
- [x] 4. Обновить handoff итоговой конкретикой: какой именно конфигурационный drift исправлен и чем доказан результат.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: `Добавляется новый behavior-change`

Уровни проверки:
- unit: обязательный
- static/contract: желателен как source-contract guard
- component/browser: не требуется
- integration: не требуется
- e2e smoke: не требуется
- live/provider: не требуется

Команды запуска:
- `npm run test:unit -- test/unit/next-dev-workspace-root-warning.test.ts`

Mock/fixture-данные и credentials:
- Используются только локальные fixture/config значения.
- Live credentials не требуются.

Примечание по статусу задач:
- Пункт 1 закрыт через lightweight runtime-like проверку на `next/dist/server/config`: fixture с двумя `package-lock.json` доказывает, что без `turbopack.root` Next эмитит duplicated lockfile warning, а с явным `turbopack.root` warning исчезает.

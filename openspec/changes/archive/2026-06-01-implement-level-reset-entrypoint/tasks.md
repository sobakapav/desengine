## Tasks

- [x] 1. Сверить архивный contract `fix-level-reset-granularity` с текущим runtime и UI.
- [x] 2. Реализовать/вернуть level-scoped reset entrypoint как отдельное UX-действие.
- [x] 3. Развести тексты подтверждения и поведение для reset уровня и reset всей задачи.
- [x] 4. Подтвердить browser-сценарием, что текущий уровень очищается без потери уже пройденных уровней.
- [x] 5. Обновить handoff итоговой конкретикой: entrypoint, state contract, route boundary и ограничения.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task`: `Пользователь сбрасывает текущий уровень через service boundary`
- `iteration`: `Пользователь открывает историю уточнений`

Уровни проверки:
- component/browser: обязательный
- integration: выполнен как boundary-proof для `POST /api/tasks/[taskId]/reset-level`
- unit: допустим как вспомогательный слой
- live/provider: не требуется

Команды запуска:
- `npm run test:integration -- test/integration/task-routes.test.ts`
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-reset-granularity.spec.ts`

Mock/fixture-данные и credentials:
- Использовать локальные task fixtures и mock runtime.
- Live credentials не требуются.

Статус покрытия:
- Integration-слой теперь явно доказывает route boundary для `POST /api/tasks/[taskId]/reset-level`, включая success payload, маппинг `snapshot_missing -> 409` и запрет на деградацию в полный reset.
- Browser verification подтверждает пользовательский сценарий reset текущего уровня: отдельные тексты confirm flow, вызов `/reset-level`, сохранение прогресса предыдущего уровня, очистка истории/результата проверки текущего уровня.

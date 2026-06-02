## Tasks

- [x] 1. Собрать repro-path текущего пользовательского пути для описания уровня 3 на рабочем экране `/lab/dipole-button`.
- [x] 2. Локализовать, какой источник приходит пользователю сейчас: `task-specific tip` остаётся в блоке `Что важно в этой задаче`, а `level overview` остаётся в раскрываемом `Полное пояснение уровня`.
- [x] 3. Исправить data/render boundary с минимальным scope.
- [x] 4. Закрепить browser-level regression guard на видимость описания уровня 3:
  - [x] 4.1 guard проходит по реальному UI-path рабочей задачи `/lab/dipole-button` с `currentLevel=3` и `status=in_progress`
  - [x] 4.2 guard живёт в отдельном `test/e2e/level-3-description-visibility.spec.ts` и проверяет конкретный `tip.md` + `overview.md`
- [x] 5. Обновить handoff итоговой конкретикой: какой именно path подтверждён, что именно проверяется и какое ограничение остаётся у проверки.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `level-labs`: `Система показывает общее пояснение уровня пользователю`
- `task`: `Система читает статичную task-specific подсказку уровня`

Уровни проверки:
- component/browser: обязательный
- unit: допустим как вспомогательный слой для data/render helpers
- integration: по необходимости
- live/provider: не требуется

Команды запуска:
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-3-description-visibility.spec.ts`

Mock/fixture-данные и credentials:
- Использовать локальные onboarding/task fixtures и временно seeded `user/tasks/dipole-button` для сценария `currentLevel=3`.
- Live credentials не требуются.

## Blockers закрытия

- Сам fix имеет выделенный browser guard и корректный verification path.
- Штатное `npm run os:close -- fix-level-3-description-visibility` сейчас блокируется внешними traceability-ошибками репозитория, не принадлежащими этому change:
  - `test/e2e/safari-task-runtime-instability.spec.ts` ссылается на неизвестный scenario;
  - `test/unit/task-start-llm.test.ts` ссылается на неизвестный scenario;
  - `level-labs` остаётся неполностью покрыт по общему traceability-слою и не внесён в `coverage-plan`.

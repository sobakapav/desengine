## Миссия

- Что должен изменить этот change: вернуть корректную очистку истории уточнений и результата проверки после `reset task` и `reset current level` в пределах соответствующего scope.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-bugfix`
- strategy_root: `focus-quality`
- release_ref: `release-2026-06-01-grooming`
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix должен оставаться локальным, доказуемым и не затрагивать progression вне того reset-scope, который явно выбрал пользователь.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику локального исправления держит `dispatcher-bugfix`, финальная приёмка идёт через внешний проверочный прогон.

## Обязательные источники

- `lib/task/server-runtime-mutations.ts`
- `test/unit/task-server-runtime-mutations.test.ts`
- `test/e2e/level-reset-granularity.spec.ts`
- `openspec/specs/iteration/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для fix-check-reset-history-regression: reset route/service boundary, связанные workbench reset-flow и любые runtime-хранилища prompt history/check-result, если они участвуют в scope очистки.

## Границы исполнения

- Что входит в этот change: локализация причины регресса, выравнивание reset-очистки для prompt history и check-result в полном и level-scoped reset, unit/browser regression guard.
- Что сознательно не входит в этот change: пересмотр UX reset, изменение semantics progression, новые reset entrypoints, чистка данных уже завершённых уровней вне выбранного scope.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: reset-контракт и bugfix-line уже заданы; этот change не превращается в redesign task-flow и не меняет стратегию quality-контура.

## Проверка результата

- verification_level: `component/browser`
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-reset-granularity.spec.ts`
- Что именно должен доказать результат проверки: после reset исчезают только относящиеся к выбранному scope история уточнений и check-result, а уже завершённые уровни сохраняют свой прогресс.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: регресс возникает только в runtime storage cleanup или также в UI rehydration; нужен ли отдельный unit-guard на полный reset задачи помимо browser-сценария для level reset.

## Миссия

- Что должен изменить этот change: вернуть пользователю видимое описание задач третьего уровня после regression в `0.1.11`.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-tasks
- strategy_root: focus-onboarding
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-tasks` держит пользовательские task guidance paths; fix должен вернуть видимость уже существующего контента, а не изобретать новый didactic material.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию onboarding task-контура держит `dispatcher-tasks`; этот fix отвечает за конкретную regression-видимость описания уровня 3.

## Обязательные источники

- openspec/changes/dispatcher-tasks/proposal.md
- openspec/changes/dispatcher-tasks/design.md
- openspec/changes/dispatcher-tasks/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-3-description-visibility: `onboarding/levels/level-3/overview.md`, `onboarding/tasks/**/levels/level-3/tip.*`, `components/desengine/lab/Workbench/WorkbenchView.tsx`, runtime loaders для level/task hints и документ-источник `https://docs.google.com/document/d/13yc4ovhcnwq0SBsdU6SZTz4Uke_Xip9ZI0sUyEKShQ0/export?format=txt`.

## Границы исполнения

- Что входит в этот change: repro missing description path, локализация data/render boundary, точечный fix и browser guard на видимость level-3 описания.
- Что сознательно не входит в этот change: переписывание текстов уровня, изменение prompt limits и общий UX-redesign workbench.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: продукт уже решил, что пользователь должен видеть уровень и task-specific контекст; этот fix восстанавливает потерянную видимость, а не меняет саму контентную политику.

## Текущая диагностика

- Актуальный runtime уже имеет два user-facing пути показа контента:
  - `TaskLevelStart` показывает `taskTip` и `commonExplanation` до старта уровня;
  - `Workbench` показывает task-specific контекст сразу и общее пояснение уровня в раскрываемом блоке после старта.
- Для текущего confirm/tracing слоя зафиксирован реальный path `GET /lab/dipole-button` при seeded progress `currentLevel=3`, `status=in_progress`:
  - в `workbench-context-block` пользователь видит task-specific подсказку из `onboarding/tasks/dipole-button/levels/level-3/tip.md`;
  - в `workbench-level-explanation` после раскрытия пользователь видит level overview из `onboarding/levels/level-3/overview.md`.
- Наиболее подозрительный слой для потери контента не UI-layout сам по себе, а server content-loading/fallback path:
  - `lib/task/hints.ts`
  - `lib/task/server-runtime-storage.ts`
  - `lib/prompt/server.ts`
- Если чтение `tip.*` или `overview.md` тихо деградирует в пустую строку, UI не падает, а показывает fallback-заглушки. Поэтому browser guard должен проверять не только наличие контейнера, но и реальный пользовательский контент уровня 3.

## Проверка результата

- verification_level: component/browser
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 npm run test:e2e -- test/e2e/level-3-description-visibility.spec.ts`
- Что именно должен доказать результат проверки: пользователь на рабочем экране уровня 3 снова видит оба текста в реальном UI path, а не только контейнеры:
  - task tip `Ура! Наконец-то можно скруглять уголки.`
  - level overview `До сих пор мы жили в одном файле`

## Итог по текущему шагу

- Добавлен отдельный browser/e2e guard `test/e2e/level-3-description-visibility.spec.ts`; логика не переносилась в `test/e2e/workbench-context-visibility.spec.ts`.
- Guard покрывает только post-start workbench path и прямо доказывает видимость описания уровня 3 на `dipole-button`.
- Внешняя browser verification подтверждена командой `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-3-description-visibility.spec.ts`: `1 passed`.
- Текущее ограничение: этот слой не доказывает pre-start экран `TaskLevelStart` и не локализует исторический commit, в котором regression впервые появился; он подтверждает только текущее поведение и даёт отдельный regression guard.

## Текущий blocker закрытия

- Verification path для самого change подтверждён и согласован с выделенным `level-3-description-visibility` browser guard.
- Штатное закрытие через `os:close` сейчас блокируется внешними traceability-ошибками репозитория, а не самим этим fix:
  - `test/e2e/safari-task-runtime-instability.spec.ts` ссылается на неизвестный scenario;
  - `test/unit/task-start-llm.test.ts` ссылается на неизвестный scenario;
  - `level-labs` остаётся неполностью покрыт по общему traceability-слою и не внесён в `coverage-plan`.

## Открытые вопросы

- Пропадало ли описание только на уровне 3 или regression-path затрагивал и другие уровни, где UI получает контент через те же fallback-границы.
- Нужен ли потом отдельный unit/source-contract test на то, что level-3 `overview.md` и task-specific `tip.*` не деградируют в пустой fallback незаметно для change layer.

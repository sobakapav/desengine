## Миссия

- Что должен изменить этот change: дать пользователю явный UX-сценарий возврата к началу текущего уровня без полного сброса задачи.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-ux
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` держит пользовательские сценарии и UX-риски как отдельный quality-контур; здесь UX-жалоба признана валидной и требует отдельного implement change.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию UX-контура держит `dispatcher-ux`; этот implement отвечает за конкретный recovery entrypoint для текущего уровня.

## Обязательные источники

- openspec/changes/dispatcher-ux/proposal.md
- openspec/changes/dispatcher-ux/design.md
- openspec/changes/dispatcher-ux/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-level-reset-entrypoint: архивный `openspec/changes/archive/2026-05-29-fix-level-reset-granularity/*`, `openspec/specs/task/spec.md`, `openspec/specs/iteration/spec.md`, `components/desengine/lab/Workbench/WorkbenchView.tsx`, `lib/task/actions/files.ts`, `app/api/tasks/[taskId]/reset-level/route.ts`, `test/e2e/level-reset-granularity.spec.ts`.

## Границы исполнения

- Что входит в этот change: UX entrypoint, confirm flow, level-scoped reset contract и browser proof на сохранение уже пройденных уровней.
- Что сознательно не входит в этот change: redesign всей progression-модели, любые новые reset-сценарии за пределами текущего уровня и unrelated bugs проверки/истории.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам курс на UX-восстановление без потери всего прогресса уже принят; implement должен довести его до рабочего пользовательского сценария.

## Проверка результата

- verification_level: component/browser
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-reset-granularity.spec.ts`
- Что именно должен доказать результат проверки: пользователь может безопасно сбросить только текущий уровень и явно видит, чем это действие отличается от полного reset задачи.

## Текущее состояние доказательств

- Runtime и UI entrypoint уже присутствуют в коде.
- Отдельный level-scoped route boundary реализован в `app/api/tasks/[taskId]/reset-level/route.ts` и делегирует в `resetCurrentTaskLevelRuntime`, не переиспользуя `resetTaskRuntime`.
- UI уже развёл пользовательские действия: `components/desengine/lab/Workbench/WorkbenchView.tsx` содержит отдельные кнопки `Сбросить уровень` и `Сбросить задачу`, разные confirm-title/description и разный confirm CTA.
- Client action layer уже использует отдельный endpoint: `components/desengine/lab/Workbench/useWorkbenchTaskActions.ts` отправляет level reset в `POST /api/tasks/:taskId/reset-level`, а полный reset — в `POST /api/tasks/:taskId/reset`.
- Integration-proof в `test/integration/task-routes.test.ts` теперь покрывает:
  - success response `200` с level-reset payload (`taskItem`, `taskData`, `started`);
  - error mapping `snapshot_missing -> 409`;
  - запрет на деградацию в полный reset через проверку, что `resetTaskRuntime` не вызывается.
- Integration-проверка подтверждена командой `npm run test:integration -- test/integration/task-routes.test.ts`: `10 passed`.
- Browser-проверка подтверждена командой `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-reset-granularity.spec.ts`: `1 passed`.
- E2E guard был обновлён под текущий Workbench UI: статус уровня проверяется через `workbench-context-status`, где runtime показывает `Уровень 2 из 5` и `Промпты 2 / 3`.

## Открытые вопросы

- Открытых вопросов для scope этого implement change нет.

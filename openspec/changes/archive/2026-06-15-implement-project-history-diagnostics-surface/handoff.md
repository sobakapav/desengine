## Миссия

- Что должен изменить этот change: поднять уже существующую project-scoped историю и диагностику на пользовательский уровень, чтобы проект был наблюдаем как рабочий контекст, а не только как контейнер настроек.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: project-aware runtime уже хранит историю и diagnostics внутри project scope; задача этой волны не в создании нового runtime, а в user-facing проявлении уже существующего следа.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, scope этой волны держит `dispatcher-project`, внешнюю финальную приёмку выполняет другой агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- `openspec/specs/projects/spec.md`
- `lib/task/project-runtime-scope.ts`
- `lib/onboarding/repository.ts`
- `lib/task/server-runtime-storage.ts`
- `lib/project/runtime.ts`

## Границы исполнения

- Что входит в этот change: history/diagnostics surface проекта, prompt/check/reset/migration readout и понятное user-facing объяснение project-scoped рабочего следа.
- Что сознательно не входит в этот change: редактирование runtime-файлов проекта, полный workflow/artifact browser, новый storage layer и изменение task/workbench orchestration.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: project boundary, task/workflow/workbench project-aware runtime, migration semantics и canonical config проекта.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: history/diagnostics surface оформлен как самостоятельный project-facing contract и не смешан с config/editor или workflow-readout волнами.

## Открытые вопросы

- Какая часть project history должна быть доступна сразу, а какая остаётся только внутренней runtime-диагностикой.

## Что сделано в реализации

- страница `app/projects/[projectId]/page.tsx` теперь поднимает server-side snapshot через `readProjectHistoryDiagnostics(projectId)` и передаёт его в project overview;
- добавлен узкий adapter `lib/project/history-diagnostics.ts`, который читает уже существующий project-scoped след из `prompt-history.json`, `check-result.json` и `.level-reset/**` без записи нового runtime state;
- на project page добавлен read-only блок `ProjectHistoryDiagnosticsPanel` с prompt history, check-result следом, reset/migration readout и кратким рабочим контекстом по задачам;
- active spec `openspec/specs/projects/spec.md` синхронизирован с новым пользовательским контрактом.

## Локальная самопроверка исполнителя

- `npm run test:unit -- test/unit/project-history-diagnostics-surface.test.ts`
- `npm run test:traceability`
- `npm run quality:text`

## Риски и ограничения

- history/diagnostics snapshot читается на сервере при загрузке страницы и не обновляется реактивно после локального редактирования project config без reload;
- MVP честно показывает только уже существующий project-scoped след в user runtime; если задача ещё не создала scoped данные, на project page она не проявится в history;
- рабочий контекст проекта остаётся explainability-friendly summary, а не файловым браузером: показываются file names и counts, но не содержимое runtime-файлов.

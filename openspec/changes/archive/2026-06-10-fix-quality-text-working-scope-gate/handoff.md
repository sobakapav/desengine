## Миссия

- Что должен изменить этот change: Восстановить проход quality:text для текущего рабочего scope: добавить отсутствующие @example у нетривиальных API и оформить временные waivers для крупных legacy-модулей с owner/reason/targetStage.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix-поток допускает только локализуемые дефекты с явным evidence; скрытый redesign под видом fix запрещён; доказательство исправления и traceability обязаны жить в самом downstream fix-change.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию линии держит `focus-quality`, тактический owner этого потока — `dispatcher-bugfix`, приёмку результата и внешний verification выполняет родительский агент этого change.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/dispatcher-bugfix/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-quality-text-working-scope-gate:
  - tools/quality-text/README.md
  - tools/quality-text/engine.mjs
  - tools/quality-text/waivers.json
  - openspec/changes/release-2026-06-10-architecture/release-notes.md

## Границы исполнения

- Что входит в этот change:
  - устранить активные нарушения `api-example` в текущем `working` scope там, где это можно сделать без изменения поведения;
  - оформить временные `waiver`-записи для крупных legacy-файлов и функций, если их безопасная декомпозиция требует отдельного refactor change;
  - обновить артефакты самого change так, чтобы внешний проверяющий мог закрыть его через `os:close`.
- Что сознательно не входит в этот change:
  - декомпозиция крупных UI/runtime/test-модулей только ради снятия `file-length` и `function-length`;
  - пересмотр лимитов quality-text или логики его правил;
  - изменения продуктового поведения ради обхода quality-gate.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - bugfix должен оставаться локальным по scope;
  - временный waiver допустим только как прозрачный управленческий долг с owner/reason/targetStage;
  - если для снятия нарушения нужен redesign, это отдельный change, а не расширение данного fix.

## Проверка результата

- verification_level: unit
- verification_command: npm run quality:text
- Что именно должен доказать результат проверки: `quality:text` проходит на текущем `working` scope без активных нарушений, а все временные исключения оформлены явно и не маскируют новые поведенческие изменения. Локальная sanity уже дала `Violations: 28`, `Waived violations: 28`, `Нарушений не найдено`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какие нарушения стоит исправить сразу через JSDoc `@example`, а какие безопаснее перевести в waiver;
    Решение: все активные `api-example` закрыты содержательными JSDoc без изменения runtime-поведения; `file-length`/`function-length` для крупных legacy-модулей переведены в waivers.
  - какие `targetStage` формулировки достаточно конкретны для последующего закрытия архитектурного долга;
    Решение: каждому waiver назначен отдельный followup-stage с привязкой к области декомпозиции (`workbench-view`, `task-route`, `project-runtime`, `browser-verification-wrapper` и т.д.).
  - нужны ли точечные unit-тесты для новых/уточнённых doc-контрактов или достаточно существующего deterministic quality-gate.
    Решение: достаточно deterministic quality-gate `npm run quality:text`, потому что change меняет только JSDoc и waiver-реестр, не runtime-поведение.

## Что изменено

- Добавлены недостающие `@example` у нетривиальных экспортируемых API в `app/api/tasks/[taskId]/reset-level/route.ts`, `components/desengine/lab/Workbench/useWorkbenchPersistence.ts`, `components/desengine/lab/Workbench/useWorkbenchTaskActions.ts`, `lib/onboarding/repository.ts`, `lib/task/actions.ts`, `lib/task/projection.ts`, `lib/task/server.ts`, `tools/openspec-handoff.mjs`.
- В `tools/quality-text/waivers.json` добавлены и уточнены waivers для всех оставшихся `file-length`/`function-length` нарушений рабочего scope, включая `OutRender`, `TaskRoute`, `WorkbenchView`, `useWorkbenchController`, `lib/project/runtime.ts`, `lib/project/storage.ts`, `lib/task/projection.ts`, крупные regression tests и `tools/testing/run-browser-verification-runtime.mjs`.
- `tasks.md` синхронизирован с фактическим выполнением change.

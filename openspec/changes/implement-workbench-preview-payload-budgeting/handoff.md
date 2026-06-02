## Миссия

- Что должен изменить этот change: ускорить user-facing preview payload pipeline Workbench и ввести bounded resource-contract для его cache и derived artifacts
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-domain
- release_ref: release-2026-06-02-quality
- producer_ref: producer-speed-and-load
- Что из родительского change уже решено: `dispatcher-workbench` уже закрепил Workbench как owner user-facing рабочего стола, preview/tool registry и downstream runtime-линии Workbench.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию user-facing speed/load держит `producer-speed-and-load`, тактику Workbench-линии держит `dispatcher-workbench`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-workbench/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/workbench/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-workbench-preview-payload-budgeting: `openspec/specs/level-labs/spec.md`, `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`, `app/api/tasks/[taskId]/sandpack/route.ts`, `lib/lab/sandpack-preview.ts`, `lib/lab/sandpack-runtime-dependencies.ts`, `lib/system/shadcn-files.ts`

## Границы исполнения

- Что входит в этот change: bounded cache policy, preview payload reuse strategy, ускорение типовой сборки preview и controlled degradation path при перегрузе preview pipeline.
- Что сознательно не входит в этот change: переписывание всего Workbench, смена Sandpack/Next.js/Turbopack и общие runtime guardrail'ы вне preview path.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: роль Workbench как owner preview/tooling loop уже закреплена `dispatcher-workbench`; этот change не переоткрывает product topology верстака.

## Проверка результата

- verification_level: component/browser
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 npm run test:e2e -- test/e2e/sandpack-preview-style-runtime.spec.ts`
- Что именно должен доказать результат проверки: preview остаётся работоспособным в user-facing сценарии, а runtime-path сборки payload получает измеримый budget и безопасную деградацию вместо бесконтрольного роста нагрузки; проверка должна опираться на fixture-режим без live credentials.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: что именно кешируется безопасно; какова политика eviction; где проходит граница между ускорением preview и риском stale payload.

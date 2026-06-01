## Миссия

- Что должен изменить этот change: ввести performance budget verdicts в общий тестовый слой для ключевых user-facing сценариев `npm run start`
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: producer-speed-and-load
- Что из родительского change уже решено: `dispatcher-test-system` уже закрепил единый тестовый слой, traceability и обязательные уровни проверки без live credentials.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, тактику тестового слоя держит `dispatcher-test-system`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-test-system/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/testing-layer/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-test-performance-budget-verdicts: `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`, `test/unit`, `test/integration`, `tools/testing`, `test/traceability/spec-coverage-map.json`, `test/traceability/coverage-plan.json`

## Границы исполнения

- Что входит в этот change: reusable verdict model, budget assertions, fixture-controlled speed checks и traceability для performance regressions.
- Что сознательно не входит в этот change: live/provider performance checks, общий profiler, runtime telemetry и переписывание всего e2e слоя.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: границы обязательного тестового слоя и его mock/fixture guardrails уже закреплены `dispatcher-test-system`.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/performance-budget-verdicts.test.ts`
- Что именно должен доказать результат проверки: тестовый слой умеет выразить и различить `ok` / `regression` / `budget-exceeded` для controlled speed-path сценариев и не зависит от live/provider нестабильности.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: как выбрать budgets, как стабилизировать измерение и как отличать speed regression от infra noise.

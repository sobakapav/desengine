## Миссия

- Что должен изменить этот change: создать reusable regression harness для controlled speed/load сценариев `npm run start`
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: producer-speed-and-load
- Что из родительского change уже решено: `dispatcher-test-system` уже закрепил, что общий тестовый слой развивается через reusable harness/fixtures и downstream implement changes.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, тактику тестового слоя держит `dispatcher-test-system`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-test-system/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/testing-layer/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-test-speed-load-regression-harness: `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`, `test/helpers`, `test/integration`, `tools/testing`, speed/load related unit and e2e tests

## Границы исполнения

- Что входит в этот change: reusable scenario harness, fixture/stub boundary, downstream reuse contract и integration-oriented speed/load scenarios.
- Что сознательно не входит в этот change: live benchmarking, provider checks, полноценный profiler и production telemetry.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам единый тестовый слой и его mock/live guardrails уже закреплены `dispatcher-test-system`.

## Проверка результата

- verification_level: integration
- verification_command: `npm run test:integration`
- Что именно должен доказать результат проверки: speed/load сценарии воспроизводятся через единый harness и не требуют ad-hoc локальных тестовых поверхностей; проверка должна быть fixture/stub-driven без live credentials.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где живёт harness, как стабилизировать cold/warm semantics и как downstream changes будут его переиспользовать.

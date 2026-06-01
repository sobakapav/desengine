## Миссия

- Что должен изменить этот change: добавить structured runtime observability для key speed/load paths в `npm run start`
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-runtime
- strategy_root: focus-tech
- release_ref: release-2026-06-02-quality
- producer_ref: producer-speed-and-load
- Что из родительского change уже решено: `dispatcher-runtime` уже держит ownership за action/service/mutation boundaries и является правильной tactical линией для runtime diagnostics этой волны.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, тактику runtime observability держит `dispatcher-runtime`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-runtime/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/task/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-runtime-speed-observability: `openspec/specs/level-labs/spec.md`, `openspec/specs/testing-layer/spec.md`, `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`, `lib/task/actions/start.ts`, `lib/task/actions/iterate.ts`, `lib/task/actions/check.ts`, `lib/lab/sandpack-preview.ts`, существующие diagnostics/log sites

## Границы исполнения

- Что входит в этот change: structured diagnostics surface, duration/size/load fields, overload/degradation signals и пригодность для downstream test tooling.
- Что сознательно не входит в этот change: внешний telemetry backend, product analytics, облачные sinks и user-facing observability UI.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: ownership runtime boundary и separation от event/log-system уже закреплены `dispatcher-runtime`.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/task-actions-boundary.test.ts test/unit/sandpack-preview.test.ts`
- Что именно должен доказать результат проверки: runtime-path оставляет structured diagnostics для speed/load сценариев и для overload/degradation branches, пригодные для downstream анализаторов и тестов; проверка должна оставаться локальной и без внешних telemetry/live зависимостей.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где живёт diagnostics contract, как удержать низкий overhead и какие поля обязательны уже в первой волне.

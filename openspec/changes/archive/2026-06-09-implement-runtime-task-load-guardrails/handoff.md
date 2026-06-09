## Миссия

- Что должен изменить этот change: сделать task action runtime bounded по очереди и общей нагрузке, чтобы `npm run start` не перегружал машину пользователя бесконтрольным backlog
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-runtime
- strategy_root: focus-tech
- release_ref: release-2026-06-02-quality
- producer_ref: producer-speed-and-load
- Что из родительского change уже решено: `dispatcher-runtime` уже закрепил runtime boundary как tactical lane для action/service/mutation contracts лаборатории.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, тактику runtime guardrail'ов держит `dispatcher-runtime`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-runtime/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/task/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-runtime-task-load-guardrails: `openspec/specs/iteration/spec.md`, `openspec/specs/level-labs/spec.md`, `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`, `lib/task/mutation-boundary.ts`, `lib/task/actions/start.ts`, `lib/task/actions/iterate.ts`, `lib/task/actions/check.ts`, `lib/task/actions/files.ts`

## Границы исполнения

- Что входит в этот change: bounded queue policy, process-level pressure limits, overload refusal contract и защита user state от частично поставленных в очередь мутаций.
- Что сознательно не входит в этот change: preview acceleration, provider-level rate limiting и пересмотр product semantics task actions.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сама runtime-line и её service/mutation ownership уже закреплена `dispatcher-runtime`; этот change не переоткрывает архитектуру lab runtime целиком.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/task-mutation-boundary.test.ts`
- Что именно должен доказать результат проверки: same-task и multi-task runtime больше не могут неограниченно накапливать backlog без явного overload-отказа, а user state остаётся консистентным; проверка должна быть локальной и не зависеть от provider/live credentials.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие лимиты выбрать; как различать active work и вредный backlog; какие ошибки показывать клиенту при отказе в постановке действия.

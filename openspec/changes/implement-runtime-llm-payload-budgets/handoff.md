## Миссия

- Что должен изменить этот change: ограничить expensive LLM input/output path и write-set в user-facing runtime до контролируемых budget'ов
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-runtime
- strategy_root: focus-tech
- release_ref: release-2026-06-02-quality
- producer_ref: producer-speed-and-load
- Что из родительского change уже решено: `dispatcher-runtime` уже держит ownership за action/service boundaries `start`, `iterate`, `check` и связанные mutation paths.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, тактику bounded runtime contract держит `dispatcher-runtime`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-runtime/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/llm/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-runtime-llm-payload-budgets: `openspec/specs/task/spec.md`, `openspec/specs/iteration/spec.md`, `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`, `lib/task/actions/start-llm.ts`, `lib/task/actions/iterate-llm.ts`, `lib/task/actions/start-stage.ts`, `lib/llm/runtime.ts`

## Границы исполнения

- Что входит в этот change: input/output budgets для LLM flows, oversized-response refusal, write-set budget и безопасный bounded error path до записи на диск.
- Что сознательно не входит в этот change: смена provider strategy, пересмотр prompt semantics и task-action queue guardrail'ы.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: ownership `start`/`iterate`/`check` runtime boundaries уже закреплён `dispatcher-runtime`; этот change не переоткрывает архитектуру task flow целиком.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/task-start-llm.test.ts test/unit/task-actions-boundary.test.ts`
- Что именно должен доказать результат проверки: oversized instruction/output/write-set больше не проходит в дорогой runtime path без явного bounded отказа и без частичного изменения пользовательских файлов; проверка должна использовать stubbed payloads без live provider.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие budget'ы выбрать; на каком шаге отказывать oversized path; как отличать budget-error от timeout/provider/network ошибок в user-facing ответе.

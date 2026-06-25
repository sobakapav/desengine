## Миссия

- Что должен изменить этот change: dispatcher focus topology contract
- Этот change меняет governance/tooling-контракт OpenSpec и не пересматривает продуктовые решения соседних линий.

## Унаследованный контекст

- parent_change: dispatcher-openspec
- strategy_root: focus-governance
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-openspec` уже закрепил OpenSpec как отдельный governance/tooling слой, где topology, handoff, release и traceability обязаны жить как системные правила, а не как локальные договорённости.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию governance-контура держит `focus-governance`, тактику OpenSpec-инструментария держит `dispatcher-openspec`, а внешний verification и приёмку должен выполнить другой агент или пользователь.

## Обязательные источники

- `AGENTS.md`
- `openspec/specs/admin-tools/spec.md`
- `tools/testing/traceability/change-rules.mjs`
- Какие ещё файлы и спецификации обязательны к чтению для fix-dispatcher-focus-topology-contract: `tools/openspec-begin-change.mjs`, `tools/README.md`, `test/unit/openspec-roadmap-inheritance.test.ts`, а также active dispatcher/producers в architecture/domain-линии, где уже протекла старая topology.

## Границы исполнения

- Что входит в этот change: обновление системных правил, traceability/tooling, unit tests и active planning texts под topology `focus -> dispatcher`.
- Что сознательно не входит в этот change: переархивация старых changes, финальный прогон verification-команд, пересмотр product semantics соседних capability.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: сам статус OpenSpec как отдельного governance/tooling слоя и базовый контракт handoff/release/traceability уже принадлежат `dispatcher-openspec` и `focus-governance`.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: traceability и user-facing tooling больше не допускают и не подсказывают `dispatcher -> producer`, при этом producer roadmap остаётся допустимым контекстом для dispatcher той же focus-орбиты.

## Открытые вопросы

- Какие active changes нужно синхронно поправить, чтобы новая topology не спорила с живым planning-слоем.

## Миссия

- Зафиксировать speed-quality как отдельную quality-линию, чтобы жалобы «система тормозит» можно было переводить в управляемый triage вместо хаотичных fixes.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` удерживает под собой quality-линии, которым нужен отдельный governance-контур.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегически идея живёт в `focus-quality`; downstream тактика будет определена отдельным producer/dispatcher change.

## Обязательные источники

- openspec/changes/focus-quality/design.md
- openspec/changes/focus-quality/roadmaps/runtime-speed-quality.md
- openspec/specs/testing-layer/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для idea-focus-quality-runtime-speed-control: текущие жалобы на latency и downstream level-labs/resource-status контексты.

## Границы исполнения

- Что входит в этот change: формулировка speed-quality идеи, её границ и downstream вопросов.
- Что сознательно не входит в этот change: runtime instrumentation, telemetry и кодовые оптимизации.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: текущие конкретные bugfix-lines остаются в своих dispatcher/fix changes; эта idea не подменяет их.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: speed-quality линия корректно оформлена как idea и имеет roadmap-владельца.

## Открытые вопросы

- Нужен ли после этой идеи отдельный producer для baseline latency-сценариев.

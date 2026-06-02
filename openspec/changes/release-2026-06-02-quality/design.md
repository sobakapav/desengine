## Context

`producer-speed-and-load` уже выделил downstream delivery для user-facing режима `npm run start`: ускорение preview payload pipeline, bounded guardrail'ы на task action runtime, budget'ы на LLM payload/write-set, observability и regression-harness. Одновременно `dispatcher-ux` держит активный implement-набор про post-success navigation, recovery entrypoint и UX-обратную связь. Для release-traceability этим активным линиям нужна общая релизная метка quality-волны.

## Goals

- Зафиксировать единый release lineage для текущей quality-волны, которая включает speed/load- и UX-линии.
- Не менять tactical ownership, producer-контекст и dispatcher-подчинение downstream changes.
- Сохранить release как no-code слой фиксации состава поставки.

## Non-goals

- Не добавлять в этот release посторонние active changes вне speed/load- и active UX-линии.
- Не менять dispatcher/topology ради release-связи.
- Не выполнять финальную верификацию внутри самого release-change.

## Decisions

1. Release включает весь текущий active speed/load-набор из `producer-speed-and-load` и всех active потомков `dispatcher-ux`.
2. `release_ref` добавляется прямо в metadata downstream changes, без смены `parent_change` и `producer_ref`.
3. Release остаётся no-code и документирует состав волны, а не её техническую реализацию.

## Risks / Trade-offs

- Более широкий релиз лучше отражает реальный active quality-срез, но смешивает speed/load и UX-поднаправления в одном delivery-пакете.
- Если позже появятся новые active UX- или speed/load changes, их нужно будет либо добавить в этот release, либо выпускать следующим отдельным release-change.

## Open Questions

- Нужна ли следующая отдельная release-волна, если после этой quality-волны появятся новые active changes вне speed/load и текущего UX-набора.

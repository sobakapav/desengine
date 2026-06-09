## Context

`producer-speed-and-load` уже выделил downstream delivery для user-facing режима `npm run start`: ускорение preview payload pipeline, bounded guardrail'ы на task action runtime, budget'ы на LLM payload/write-set, observability, regression-harness и связанные bugfix changes вокруг preview/runtime boundary. Для release-traceability этим under-the-hood quality changes нужна единая релизная метка.

## Goals

- Зафиксировать единый release lineage для текущей under-the-hood quality-волны без прямых активных UX-change.
- Не менять tactical ownership, producer-контекст и dispatcher-подчинение downstream changes.
- Сохранить release как no-code слой фиксации состава поставки.

## Non-goals

- Не добавлять в этот release посторонние active changes вне under-the-hood quality-линии.
- Не менять dispatcher/topology ради release-связи.
- Не выполнять финальную верификацию внутри самого release-change.

## Decisions

1. Release включает under-the-hood quality-набор из `producer-speed-and-load`, downstream regression/runtime-hardening changes и связанные bugfix changes, но не включает прямые UX-change.
2. `release_ref` добавляется прямо в metadata downstream changes, без смены `parent_change` и `producer_ref`.
3. Release остаётся no-code и документирует состав волны, а не её техническую реализацию.

## Risks / Trade-offs

- Отдельный quality-release лучше отражает подкапотный характер поставки, но требует дисциплины: прямые UI/UX changes нужно выводить в отдельный релиз.
- Если позже появятся новые under-the-hood quality changes, их нужно либо добавить в этот release, либо выпускать следующей quality-волной.

## Open Questions

- Нужна ли следующая отдельная quality-волна, если после этого релиза появятся новые active changes вне текущего under-the-hood набора.

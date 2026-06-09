## Context

В текущем workflow `os:dispatch` release-привязка живёт поверх нескольких артефактов:

- `.openspec.yaml` хранит структурный `release_ref`;
- `handoff.md` хранит inherited context, на который потом опирается исполнитель и проверяющий.

Если обновляется только один из этих источников, release inclusion становится недостоверным. Команда может считать, что change уже в релизе, а traceability и handoff будут говорить разное.

## Goals

- Сделать release inclusion полной, а не частичной операцией.
- Удержать `.openspec.yaml` и `handoff.md` в синхронном состоянии.
- Блокировать ложный success, если sync не завершился полностью.

## Non-goals

- Не вводить общий transactional storage layer.
- Не менять формат `handoff.md` вне служебных inherited полей.
- Не затрагивать unrelated metadata-поля.

## Decisions

1. Release inclusion синхронизирует оба артефакта.

   После назначения `release_ref` change обязан иметь одно и то же значение:
   - в `.openspec.yaml`;
   - в inherited context блока `handoff.md`.

2. Handoff обновляется точечно, а не переписывается целиком.

   Команда должна менять только служебные inherited fields (`parent_change`, `strategy_root`, `release_ref`, `producer_ref`, verification fields), чтобы не стирать ручной контент исполнителя.

3. После sync выполняется явная post-check в том же tool path.

   Если metadata и handoff расходятся, команда падает с ошибкой и не печатает успешное завершение release dispatch.

## Risks

- Если существующий handoff сломан или потерял обязательные inherited lines, release dispatch начнёт падать чаще, чем раньше.
- Более жёсткий sync-контроль может вскрыть старые ручные правки в active changes.

## Trade-offs

- Точечный sync сложнее простого rewrite, зато не уничтожает содержимое handoff.
- Жёсткая post-check делает поведение строже, но убирает тихие поломки lineage.

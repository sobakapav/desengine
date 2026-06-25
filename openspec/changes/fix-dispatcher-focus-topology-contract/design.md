## Context

В governance-слое уже накопилось расслоение:

- metadata большинства active dispatcher changes указывают на `focus-*` как на parent;
- active spec и часть planning changes до сих пор допускают `parent_change` dispatcher на producer;
- `dispatcher-architecture` дополнительно использует roadmap producer-а и тем самым показывает, что producer-контекст реально нужен, но не как иерархия.

Если оставить это как есть, инструменты будут продолжать закреплять неправильную модель и заставлять новые changes повторять конфликт.

## Goals

- Зафиксировать единую topology для dispatcher: child соответствующего `focus`.
- Сохранить producer как полного owner линии без превращения его в обязательного parent для dispatcher.
- Разрешить producer roadmap как контекст конкурирующей линии внутри той же focus-орбиты.
- Синхронизировать rule layer, tooling и active planning texts.

## Non-goals

- Не отменять прямой `parent_change` от `implement/fix` к producer.
- Не переосмысливать release topology.
- Не делать массовую миграцию архивных changes.

## Decisions

1. `dispatcher` всегда имеет `parent_change` на `focus`.

2. `producer` и `dispatcher` одной линии не выражают отношение через `parent_change`.
   Их связь проходит через:
   - общий `focus`;
   - roadmap стратегических owners;
   - `producer_ref` только на implement/fix уровне;
   - содержательное расхождение по способу доставки.

3. Producer roadmap допустим для dispatcher, если producer принадлежит той же focus-орбите.
   Это нужно, чтобы dispatcher мог потреблять producer pressure и sequencing без ложной иерархии.

4. User-facing tooling не должно подсказывать модель `dispatcher under producer`.

5. Active planning texts, которые уже протащили старую модель, нужно выровнять хотя бы в живом active слое.

## Scope

В этот change входят:

- `AGENTS.md`;
- active `openspec/specs/admin-tools/spec.md`;
- traceability validation для topology и roadmap inheritance;
- unit tests OpenSpec governance-layer;
- active planning texts `dispatcher-architecture`, `dispatcher-project`, `dispatcher-workflow`, `producer-workbench`, `fix-producer-full-responsibility-contract`;
- metadata `dispatcher-architecture`.

## Risks / Trade-offs

- [Риск] Слишком жёсткая проверка roadmap inheritance сломает рабочие dispatcher changes.
  -> Mitigation: разрешать producer roadmap в той же focus-орбите, а не только от прямых предков.

- [Риск] Producer ownership начнут трактовать как ослабленный из-за отсутствия parentage к dispatcher.
  -> Mitigation: явно фиксировать в правилах, что producer остаётся owner смысла и roadmap, а конкуренция с dispatcher считается полезной.

- [Риск] Активные changes останутся с конфликтующими формулировками.
  -> Mitigation: сразу обновить хотя бы active planning слой, где конфликт уже явный.

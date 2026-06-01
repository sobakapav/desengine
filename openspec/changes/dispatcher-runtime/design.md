## Context

После перехода от `dispatcher-architecture-transformation` к `producer-architecture-transformation` стратегический roadmap остался, но часть старых implement changes потеряла корректный tactical parent. Для `implement-lab-runtime-contract-hardening` это создало ложную привязку к `dispatcher-dataflow`, хотя содержательно change укрепляет lab runtime, а не общий контур передачи данных.

## Decisions

1. `dispatcher-runtime` отвечает за тактическую delivery-линию lab runtime foundation:
   - service boundary;
   - mutation boundary;
   - canonical route/runtime contracts;
   - cleanup/fix changes, усиливающие эти границы.

2. `dispatcher-runtime` не дублирует producer-level roadmap:
   - sequencing и architectural rationale остаются в `producer-architecture-transformation`;
   - dispatcher держит ownership конкретных runtime-hardening implement/fix changes.

3. `implement-lab-runtime-contract-hardening` становится первым закрываемым change этой линии.

4. Если появятся follow-up runtime refactor changes, не меняющие продуктовую волну, они должны ссылаться на `dispatcher-runtime`, пока речь идёт именно про lab runtime foundation.

## Scope Dispatcher

Dispatcher обязан удерживать:

- корректного tactical parent для runtime-hardening changes;
- связь с `focus-tech/roadmaps/architecture-transformation.md`;
- separation between runtime foundation lane и соседними dispatcher-контрами (`dispatcher-dataflow`, `dispatcher-packaging-*`, `dispatcher-log-system`).

## Risks / Trade-offs

- [Риск] Dispatcher окажется слишком узким и будет содержать один уже выполненный change.
  → Mitigation: считать это допустимой ценой за корректную lineage и закрываемость foundation change.

- [Риск] Runtime cleanup начнут случайно уводить в event или packaging lines.
  → Mitigation: явно держать `dispatcher-runtime` как tactical owner для lab runtime boundary work.

## Open Questions

- Понадобится ли отдельный runtime-cleanup dispatcher после закрытия текущего foundation change, или `dispatcher-runtime` останется точкой для follow-up fix changes.

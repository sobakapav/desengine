# ADR-0001: Governance-источники и правила обновления

- Статус: `accepted`
- Дата: `2026-06-10`
- Tactical owner: `dispatcher-architecture`

## Контекст

Архитектурная линия уже зафиксирована producer и dispatcher change-артефактами, но до этого change у неё не было живого governance-набора, по которому можно принимать downstream решения. Из-за этого архитектурные границы рисковали остаться:

- только в обсуждениях и design-документах changes;
- без устойчивой привязки к коду;
- без понятного правила, когда обновлять карту, словарь и ADR одновременно.

## Решение

В качестве обязательных governance-источников архитектурной линии принимаются:

1. `docs/architecture/map.md` как рабочая карта слоёв, ключевых сущностей и правил маршрутизации architecture-facing changes.
2. `docs/architecture/glossary.md` как словарь архитектурных сущностей и исключений.
3. `docs/architecture/adr/**` как реестр решений, которые уже обязательны для downstream changes.

Дополнительные правила:

- `dispatcher-architecture` является tactical owner этого набора документов;
- producer остаётся стратегическим owner общей архитектурной картины;
- change, который меняет архитектурную границу, обязан синхронно обновлять все затронутые governance-источники, а не только один файл;
- если change меняет предметный runtime, но не меняет архитектурное правило, он может ссылаться на governance-документы без их переписывания.

## Последствия

Положительные:

- downstream changes получают единый набор файлов, на который можно ссылаться в handoff и design;
- у `dispatcher-architecture` появляется конкретный operational контур, а не абстрактная обязанность "держать архитектуру";
- новые сущности и границы не должны появляться анонимно.

Ограничения:

- этот ADR не фиксирует naming rules, routing map и boundary contracts по деталям;
- эти темы должны оформляться отдельными downstream governance-артефактами.

## Связанные материалы

- `openspec/changes/dispatcher-architecture/design.md`
- `openspec/changes/producer-architecture-transform/design.md`
- `docs/architecture/map.md`
- `docs/architecture/glossary.md`

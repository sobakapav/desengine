## Why

После фиксации `producer-architecture-transform` нужен tactical owner, который будет удерживать архитектуру как живую operating line, а не как разовое обсуждение.

Нужен отдельный dispatcher, который:

- держит operational backlog архитектурной линии;
- развивает ADR и архитектурную карту;
- следит, чтобы важные сущности реально проявлялись в коде;
- маршрутизирует downstream `implement-*` / `fix-*` changes;
- не даёт producer-линии расплыться в абстрактную документацию.

## What Changes

- Вводится `dispatcher-architecture` как tactical owner архитектурной линии в `focus-tech`, но уже не как абстрактный sibling под focus, а как прямой downstream dispatcher у `producer-architecture-transform`.
- Dispatcher фиксирует свою зону ответственности:
  - архитектурная карта;
  - ADR;
  - словарь сущностей;
  - правила именования;
  - модульные границы;
  - контракты взаимодействия между крупными частями системы.
- Dispatcher получает два явных lineage-якоря:
  - `parent_change=producer-architecture-transform` как tactical подчинение producer-линии;
  - ссылку на `producer-architecture-transform/roadmaps/architecture-implementation.md` как operational источник downstream waves.
- Dispatcher становится первым operational получателем implementation plan от `producer-architecture-transform` и не переоткрывает решения producer по составу архитектурной карты.

## Non-goals

- Не заменяет producer и не дублирует его vision.
- Не реализует runtime behavior сам по себе.
- Не подменяет собой предметные dispatcher-линии вроде runtime, dataflow, log-system или ui-kit.

## Capabilities

### Modified Capabilities

- `architecture-roadmap`: появляется tactical dispatcher архитектурной карты и кодовых границ.
- `openspec-tooling`: ADR и словарь сущностей получают tactical owner.
- `testing-layer`: downstream behavior-change changes этой линии обязаны явно описывать verification и traceability.

## Impact

- `focus-tech` получает отдельный dispatcher, который отвечает не за одну подсистему, а за целостность архитектурной карты и её проявление в коде.
- Downstream changes получают корректного tactical parent для архитектурных модульных и naming-граничных изменений и явный producer-контекст архитектурной линии.

## Acceptance Criteria

- `dispatcher-architecture` отображается в дереве OpenSpec как активный dispatcher в `focus-tech`.
- Его parent/ownership lineage явно задан так, что tactical dispatcher подчинён `producer-architecture-transform`, а не висит отдельной веткой напрямую под `focus-tech`.
- У dispatcher есть явная ссылка на implementation plan producer'а как на operational backlog source.
- У dispatcher есть понятная tactical зона ответственности: карта, ADR, именование, модульные границы, контракты взаимодействия.
- Dispatcher достаточно описан, чтобы быть родителем для downstream architecture implementation/fix waves.

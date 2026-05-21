# Roadmap: Log System

## Владелец

`focus-tech` владеет техническим roadmap product event log и использует его для `dispatcher-log-system`.

## Что считается целью

- удерживать log-system как отдельную архитектурную линию рядом с envelope contract;
- не тянуть storage и lifecycle implementation раньше времени;
- позволять producer-контексту формировать ожидания к event-слою без подмены технической тактики.

## Какие изменения должен порождать roadmap

- `dispatcher-*` для тактического разведения contract, log boundary и storage readiness;
- `implement-*` только после фиксации минимальной runtime boundary;
- `fix-*` для быстрых коррекций, если runtime-граница начнёт расходиться с зафиксированным контуром.

# Roadmap: Event Envelope

## Владелец

`focus-tech` владеет техническим roadmap общего event envelope и использует его для `dispatcher-event-envelope`.

## Что считается целью

- удерживать единый технический контракт события для downstream runtime- и product-слоёв;
- не смешивать envelope, payload profile и log-system в один безразмерный контур;
- держать архитектурные границы события отдельно от producer-ожиданий по experience/action/cost.

## Какие изменения должен порождать roadmap

- `dispatcher-*` для тактического удержания event contract и downstream implementation;
- `implement-*` после фиксации contract-first инвариантов;
- `producer-*` только если нужен отдельный roadmap ожиданий, конфликтующий или пересекающийся с технической delivery-линией.

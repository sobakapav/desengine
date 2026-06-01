# Roadmap: Dataflow

## Владелец

`focus-tech` владеет техническим roadmap product dataflow и использует его для `dispatcher-dataflow`.

## Что считается целью

- удерживать единый технический dataflow-контур для downstream runtime- и product-слоёв;
- не смешивать envelope, payload profile, propagation и log-system в один безразмерный контур;
- держать архитектурные границы движения данных отдельно от producer-ожиданий по experience/action/cost.

## Какие изменения должен порождать roadmap

- `dispatcher-*` для тактического удержания dataflow-contract и downstream implementation;
- `implement-*` после фиксации contract-first инвариантов;
- `producer-*` только если нужен отдельный roadmap ожиданий, конфликтующий или пересекающийся с технической delivery-линией.

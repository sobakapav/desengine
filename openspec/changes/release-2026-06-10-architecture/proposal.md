## Why

Архитектурная трансформация уже перестала быть локальной внутренней темой. В активном слое OpenSpec у неё есть как минимум стратегический и тактические контуры:

- `producer-architecture-transform` задаёт общий смысл линии;
- `dispatcher-architecture` оформляет tactical ownership архитектурной карты и ADR;
- `dispatcher-runtime` выделяет первую foundation-wave вокруг runtime hardening.

Без отдельной релизной метки эта линия читается как набор связанных, но разрозненных changes. Нужен release, который соберёт старт архитектурной волны в единый delivery-срез и сразу задаст понятный лейтмотив: «Начинаем трансформацию архитектуры продукта».

## What Changes

- Создан release change `release-2026-06-10-architecture`.
- Релиз опирается на архитектурную линию:
  - `producer-architecture-transform` как стратегический контекст;
  - `dispatcher-architecture`, `dispatcher-runtime` и `dispatcher-project` как tactical owners.
- В сам релизный состав как в delivery-матрицу включены только исполнительские changes:
  - `implement-project-workspace-mvp`
  - `implement-project-task-onboarding-binding`
  - `implement-project-workflow-binding`
  - `implement-project-workbench-preview-binding`
  - `fix-project-ui-kit-migration-invalidation`
- Release фиксирует общий смысл стартовой волны:
  - архитектура признаётся пользовательски значимой линией продукта;
  - у линии есть стратегический owner и первые tactical owners;
  - foundation-направления начинают оформляться как отдельные управляемые lanes;
  - `Project` начинает оформляться как новый верхний контекст продукта через отдельную domain-wave, а не как частный preview-state;
  - workflow внутри project-wave оформляется как самостоятельный process-layer, а не как придаток task или workbench.
- Release фиксирует состав поставки, но не меняет `parent_change`, `strategy_root` и tactical ownership downstream changes.

## Impact

- Начало архитектурной трансформации читается как единая product-facing волна, а не как разрозненные governance-артефакты.
- Первые project-facing implement/fix changes получают тот же release lineage и читаются как часть архитектурной перестройки продукта.
- Следующие архитектурные implement/fix changes можно будет привязывать к новой волне без смешивания с quality- или UI-релизами.

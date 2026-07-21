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
  - `implement-project-entry-surface`
  - `implement-project-workflow-binding`
  - `implement-project-workbench-preview-binding`
  - `fix-project-ui-kit-migration-invalidation`
  - `implement-project-user-surface-foundation`
  - `implement-project-component-assignment-surface`
  - `implement-project-config-and-ui-kit-contract`
  - `implement-project-history-diagnostics-surface`
  - `implement-project-workflow-readout-surface`
  - `fix-project-ui-mode-removal`
  - `implement-project-component-registry-and-create-flow`
  - `implement-project-component-workflow-entrypoint`
  - `implement-project-workflow-run-observability`
  - `implement-workbench-workflow-session-surface`
  - `implement-workflow-component-aware-surface-labels`
  - `implement-workflow-image-component-foundation`
  - `implement-workflow-point-session-control`
  - `implement-workflow-point-guidance-and-prompt-focus`
  - `implement-workflow-point-artifact-generation-control`
  - `implement-editorial-shell-style-foundation`
- Release фиксирует общий смысл стартовой волны:
  - архитектура признаётся пользовательски значимой линией продукта;
  - у линии есть стратегический owner и первые tactical owners;
  - foundation-направления начинают оформляться как отдельные управляемые lanes;
  - `Project` начинает оформляться как новый верхний контекст продукта через отдельную domain-wave, а не как частный preview-state;
  - workflow внутри project-wave оформляется как самостоятельный process-layer, а не как придаток служебного runtime или workbench.
  - после foundation-wave проект начинает проявляться в пользовательском мире как отдельный раздел, а не только как скрытый runtime context.
  - следующая user-facing волна расширяет путь до `project -> component -> workflow -> workbench -> preview`, а не останавливается на одном project overview.
  - visual language релиза должен помогать читать этот путь как один продуктовый маршрут, а не как набор несвязанных внутренних экранов.
- Release фиксирует состав поставки, но не меняет `parent_change`, `strategy_root` и tactical ownership downstream changes.
- Release остаётся живым контейнером текущей архитектурной волны: новые user-facing project changes и supporting shell-изменения этой же линии могут входить в него через `release_ref`, пока не открыт следующий архитектурный срез.

## Impact

- Начало архитектурной трансформации читается как единая product-facing волна, а не как разрозненные governance-артефакты.
- Первые project-facing implement/fix changes получают тот же release lineage и читаются как часть архитектурной перестройки продукта.
- User-facing visual foundation можно доводить в том же релизе без открытия отдельной параллельной псевдо-волны, если она напрямую усиливает читаемость project/workflow path.
- Следующие архитектурные implement/fix changes можно будет привязывать к новой волне без смешивания с quality- или UI-релизами.

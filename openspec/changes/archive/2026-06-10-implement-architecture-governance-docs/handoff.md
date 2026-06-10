## Миссия

- Что должен изменить этот change: Создать живые артефакты архитектурной карты, ADR и словаря сущностей для tactical ownership dispatcher-architecture
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-architecture
- strategy_root: focus-tech
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-architecture` уже признан tactical owner архитектурной линии, его зона ответственности ограничена картой архитектуры, ADR, словарём сущностей, naming discipline, модульными границами и контрактами взаимодействия; producer-уровень сохраняет стратегическую рамку через `producer-architecture-transform`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию и порядок волн задают `focus-tech` и `producer-architecture-transform`; тактический ownership governance-артефактов удерживает `dispatcher-architecture`; итоговую внешнюю проверку и приёмку выполняет отдельный агент или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-architecture/proposal.md
- openspec/changes/dispatcher-architecture/design.md
- openspec/changes/dispatcher-architecture/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-architecture-governance-docs:
  - `openspec/changes/focus-tech/roadmaps/architecture-transformation.md`
  - `openspec/changes/producer-architecture-transform/design.md`
  - `openspec/changes/producer-architecture-transform/roadmaps/architecture-implementation.md`
  - `openspec/changes/archive/2026-05-20-architecture-capital-analysis-2026-05-19/artifacts/as-is-map.md`
  - `openspec/changes/archive/2026-05-20-architecture-capital-analysis-2026-05-19/artifacts/target-architecture.md`
  - `docs/event-envelope-mvp.md` как опора для сущности `EventEnvelope`

## Границы исполнения

- Что входит в этот change: создать `docs/architecture/map.md`, `docs/architecture/glossary.md`, ADR-реестр и стартовый набор ADR-файлов; синхронизировать handoff, design и metadata change так, чтобы документы можно было использовать как живой governance-набор для downstream architecture changes.
- Что сознательно не входит в этот change: изменение `dispatcher-architecture`; выпуск release notes; реализация naming docs, routing docs и boundary docs; изменение install-critical инфраструктуры; любые runtime/product behavior-изменения.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: producer и parent dispatcher уже зафиксировали сам факт существования архитектурной линии, её tactical ownership, порядок волн реализации, набор сквозных сущностей `код / LLM / бюджет / дизайн`, запрет на жёсткое отношение `один шаг = один верстак` и приоритет lab UX над архитектурной чистотой.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: change корректно оформлен как документарный governance-срез, его OpenSpec-артефакты согласованы с metadata, а созданные документы можно использовать как обязательные источники истины для downstream changes без live credentials и runtime execution.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какие именно сущности и слои уже достаточно стабильны, чтобы их зафиксировать как baseline;
  - где провести границу между этой картой и соседними governance-документами другого worker;
  - какие стартовые ADR нужны, чтобы реестр был рабочим сразу, а не оставался пустым каркасом.

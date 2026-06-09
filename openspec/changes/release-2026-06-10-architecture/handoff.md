## Миссия

- Зафиксировать новый active release `release-2026-06-10-architecture` как старт архитектурной трансформации продукта.
- Удержать лейтмотив волны: «Начинаем трансформацию архитектуры продукта».

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что уже решено: `producer-architecture-transform` признал архитектуру пользовательски значимой линией; `dispatcher-architecture` и `dispatcher-runtime` уже оформляют первые tactical lanes этой трансформации; `producer-project` потребовал реального появления сущности `Project`, а `dispatcher-project` с downstream implement/fix changes оформляют первую domain-wave этой перестройки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию линий держат соответствующие producer changes, тактическое исполнение ведут dispatcher и downstream behavior-change changes, а release фиксирует только стартовый состав архитектурной волны.

## Обязательные источники

- `openspec/changes/release-2026-06-10-architecture/proposal.md`
- `openspec/changes/producer-architecture-transform/proposal.md`
- `openspec/changes/producer-architecture-transform/design.md`
- `openspec/changes/dispatcher-architecture/proposal.md`
- `openspec/changes/dispatcher-runtime/proposal.md`
- `openspec/changes/producer-project/proposal.md`
- `openspec/changes/dispatcher-project/proposal.md`

## Границы исполнения

- Что входит в этот change: создание релизной метки, описание стартового состава архитектурной волны и фиксация её лейтмотива.
- Что сознательно не входит в этот change: реализация downstream architecture behavior, смена ownership существующих changes, включение в релиз посторонних quality/UI-линий.
- Какие решения уже принадлежат downstream тактике и не должны переоткрываться: содержательные рамки producer и dispatcher changes, их tactical scope и implementation plan.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: release change корректно оформлен, technical и domain части архитектурной трансформации читаются как единый delivery-срез и не смешиваются с соседними релизными линиями.

## Открытые вопросы

- Какие следующие implementation-level changes архитектурной и project-линии должны оставаться в этом релизе, а какие лучше выносить в следующий архитектурный срез.

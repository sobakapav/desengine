## Миссия

- Что должен изменить этот change: Подготовить playbook маршрутизации downstream changes по модульным границам, naming discipline и контрактам взаимодействия
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-architecture
- strategy_root: focus-tech
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-architecture` уже признан tactical owner архитектурной линии, его зона ответственности ограничена картой, ADR, словарём сущностей, naming discipline, модульными границами и контрактами взаимодействия; producer-линия уже решила, что не каждый архитектурный вопрос становится отдельным dispatcher и что предметные dispatcher не должны подменяться architecture-линией.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-architecture-transform`, тактику и routing backlog держит `dispatcher-architecture`, а этот implement change подготавливает исполнительский playbook и unit-контракт для дальнейшей внешней приёмки родителем.

## Обязательные источники

- openspec/changes/dispatcher-architecture/proposal.md
- openspec/changes/dispatcher-architecture/design.md
- openspec/changes/dispatcher-architecture/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-architecture-routing-playbook: `openspec/changes/focus-tech/roadmaps/architecture-transformation.md`, `openspec/changes/producer-architecture-transform/design.md`, `openspec/changes/producer-architecture-transform/roadmaps/architecture-implementation.md`, а также существующие unit-контракты `test/unit/openspec-handoff.test.ts` и `test/unit/change-testing-guidance.test.ts`, чтобы playbook не расходился с правилами handoff и verification.

## Границы исполнения

- Что входит в этот change: создание practical playbook в `docs/architecture/routing/playbook.md`; фиксация naming discipline для крупных модулей в `docs/architecture/naming-discipline.md`; фиксация guidance по boundary/interaction contract в `docs/architecture/boundary-interaction-contracts.md`; синхронизация metadata и задач самого implement change; добавление узкого unit-контракта на обязательное содержание новых документов.
- Что сознательно не входит в этот change: изменения `openspec/changes/dispatcher-architecture/**`; архитектурная карта, ADR и словарь сущностей как самостоятельные deliverables; release notes; runtime/product behavior; введение новых dispatcher-линий; закрытие change через `os:close`.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: ownership архитектурной линии остаётся у `dispatcher-architecture`; producer уже определил, что архитектурная трансформация остаётся user-significant producer-line; список архитектурных тем dispatcher ограничен картой, ADR, naming discipline, модульными границами и interaction contracts; install-critical стек не пересматривается.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/architecture-routing-playbook-docs.test.ts
- Что именно должен доказать результат проверки: playbook-документы не деградировали до пустых деклараций и всё ещё содержат критерии маршрутизации между `dispatcher-architecture` и предметными dispatcher-линиями, naming rules для крупных сущностей и обязательный evidence-набор для boundary changes.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие routing-признаки считать достаточными для эскалации в `dispatcher-architecture`; как сформулировать naming discipline без спора о вкусе; какой минимальный набор evidence обязан сопровождать изменение архитектурной границы, чтобы родитель мог быстро принять downstream change.

## Миссия

- Что должен изменить этот change: Синхронизировать active OpenSpec contract architecture-roadmap с новым routing-playbook и снять блокировку traceability при закрытии architecture changes
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-architecture
- strategy_root: focus-tech
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-architecture` уже закрепил tactical ownership архитектурной линии, связал себя с `producer-architecture-transform` и routing-playbook артефактами, а downstream docs/test уже используют capability `architecture-roadmap` как предмет доказательства.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию линии задают `focus-tech` и `producer-architecture-transform`, tactical ownership и приёмку результата этого fix держит `dispatcher-architecture`, исполнитель отвечает только за синхронизацию active contract и traceability-артефактов.

## Обязательные источники

- openspec/changes/dispatcher-architecture/proposal.md
- openspec/changes/dispatcher-architecture/design.md
- openspec/changes/dispatcher-architecture/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-architecture-roadmap-traceability-contract: `openspec/changes/producer-architecture-transform/design.md`, `openspec/changes/producer-architecture-transform/roadmaps/architecture-implementation.md`, `openspec/changes/archive/2026-05-21-producer-architecture-transformation/specs/architecture-roadmap/spec.md`, `test/unit/architecture-routing-playbook-docs.test.ts`, `openspec/specs/testing-layer/spec.md`, `openspec/specs/admin-tools/spec.md`.

## Границы исполнения

- Что входит в этот change: создать или синхронизировать active spec `openspec/specs/architecture-roadmap/spec.md`, добавить delta-spec этого fix, привести `handoff/tasks/release-note` в состояние readiness и при необходимости минимально уточнить traceability-ссылки теста без изменения смысла доказательства.
- Что сознательно не входит в этот change: переписывание `docs/architecture/**`, пересмотр ownership `dispatcher-architecture` vs `producer-architecture-transform`, закрытие change через `os:close`, финальный прогон verification-команд.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: tactical owner архитектурной линии уже определён как `dispatcher-architecture`; producer-линия уже определила roadmap волн, зону ответственности dispatcher и принцип, что важная архитектурная граница должна иметь явный evidence в коде и документации.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/architecture-routing-playbook-docs.test.ts
- Что именно должен доказать результат проверки: unit-traceability для routing-playbook docs ссылается на существующий active capability `architecture-roadmap`, а scenario metadata теста читаются как реальные active scenarios без подмены на другой capability.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: достаточно ли синхронизации active spec без правки теста; какие routing/evidence scenarios нужно закрепить в active contract дословно; нужен ли дополнительный delta-spec в самом fix change для легального восстановления capability в active слое.

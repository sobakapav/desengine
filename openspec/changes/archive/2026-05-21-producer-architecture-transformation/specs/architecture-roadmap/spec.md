## ADDED Requirements

### Requirement: Архитектурный dispatcher задаёт порядок transformation changes

Система разработки SHALL иметь roadmap-dispatcher, который описывает последовательность архитектурных changes, их статус, зависимости и причины порядка.

#### Scenario: Команда выбирает следующий архитектурный шаг
- **WHEN** команда завершила стабилизацию lab runtime и Project/Sandpack boundary
- **THEN** dispatcher указывает следующий transformation change только среди шагов со статусом `active` или `planned`
- **AND** объясняет, какой риск этот change снижает
- **AND** не предлагает архивированный foundation-step как следующий change
- **AND** перечисляет changes, которые должны ждать его завершения

#### Scenario: Dispatcher отделяет завершённый foundation от активной очереди
- **WHEN** часть архитектурных changes уже реализована и архивирована
- **THEN** roadmap помечает их как `done`
- **AND** отделяет их от текущей активной очереди
- **AND** сохраняет dependency context для downstream changes

#### Scenario: Governance baseline не блокирует runtime progress
- **WHEN** `code-readability-practices` включён в архитектурную орбиту
- **THEN** он используется как baseline для ревью и новых changes
- **AND** не блокирует выполнение runtime transformation changes отдельными незавершёнными checks

#### Scenario: Readability cleanup живёт в отдельной follow-up lane
- **WHEN** в quality subsystem есть временные waiver'ы для архитектурного cleanup
- **THEN** dispatcher относит их к статусу `cleanup`
- **AND** связывает их с уже завершёнными foundation boundaries
- **AND** не подменяет ими следующую capability-очередь

#### Scenario: Готовые platform primitives выбираются до Workbench implementation
- **WHEN** команда планирует новый Workbench tool или runtime primitive
- **THEN** dispatcher направляет её через `platform-component-sourcing-strategy`
- **AND** реализация фиксирует решение `reuse`, `adapt` или `build` до добавления зависимости или собственного runtime

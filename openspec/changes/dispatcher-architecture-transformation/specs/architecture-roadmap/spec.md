## ADDED Requirements

### Requirement: Архитектурный dispatcher задаёт порядок transformation changes

Система разработки SHALL иметь roadmap-dispatcher, который описывает последовательность архитектурных changes, их зависимости и причины порядка.

#### Scenario: Команда выбирает следующий архитектурный шаг
- **WHEN** команда завершила стабилизацию lab runtime и Project/Sandpack boundary
- **THEN** dispatcher указывает следующий transformation change
- **AND** объясняет, какой риск этот change снижает
- **AND** перечисляет changes, которые должны ждать его завершения

#### Scenario: Governance baseline не блокирует runtime progress
- **WHEN** `code-readability-practices` включён в архитектурную орбиту
- **THEN** он используется как baseline для ревью и новых changes
- **AND** не блокирует выполнение runtime transformation changes отдельными незавершёнными checks

#### Scenario: Готовые platform primitives выбираются до Workbench implementation
- **WHEN** команда планирует новый Workbench tool или runtime primitive
- **THEN** dispatcher направляет её через `platform-component-sourcing-strategy`
- **AND** реализация фиксирует решение `reuse`, `adapt` или `build` до добавления зависимости или собственного runtime

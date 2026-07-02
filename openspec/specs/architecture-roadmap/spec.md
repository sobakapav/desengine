# architecture-roadmap Specification

## Purpose

Зафиксировать active контракт архитектурной roadmap-линии: кто управляет порядком архитектурных changes, как routing отделяет ownership `dispatcher-architecture` от предметных dispatcher-линий и какой evidence обязателен при изменении архитектурной границы.

## Requirements

### Requirement: Архитектурный dispatcher задаёт порядок transformation changes

Система разработки SHALL иметь roadmap-dispatcher, который описывает последовательность архитектурных changes, их статус, зависимости и причины порядка.

#### Scenario: Команда выбирает следующий архитектурный шаг
- **WHEN** команда завершила стабилизацию project/workflow boundary
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

### Requirement: Routing playbook удерживает owner архитектурной границы

Система разработки SHALL использовать capability `architecture-roadmap` как active контракт маршрутизации downstream changes между `dispatcher-architecture` и предметными dispatcher-линиями, не подменяя смысл evidence-пакета переименованием capability.

#### Scenario: Родитель маршрутизирует downstream change через dispatcher-architecture
- **WHEN** change меняет архитектурную карту, naming discipline, модульную границу или interaction contract между крупными частями системы
- **THEN** routing относит change к `dispatcher-architecture`
- **AND** parent ownership фиксирует архитектурную границу как отдельный предмет реализации

#### Scenario: Предметный dispatcher остаётся owner, если граница уже определена
- **WHEN** change реализует поведение внутри уже зафиксированной предметной границы
- **THEN** owner остаётся у соответствующего предметного dispatcher
- **AND** `dispatcher-architecture` не подменяет собой существующую предметную линию только из-за наличия архитектурного evidence

#### Scenario: Изменение архитектурной границы требует evidence-пакет
- **WHEN** downstream change сдвигает boundary или interaction contract
- **THEN** change показывает evidence-пакет с routing-обоснованием, boundary contract и naming signal
- **AND** traceability ссылается на capability `architecture-roadmap` и понятные scenario active spec

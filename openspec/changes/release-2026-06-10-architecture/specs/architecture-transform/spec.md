## MODIFIED Requirements

### Requirement: Архитектурная трансформация считается пользовательски значимой линией продукта

Система разработки SHALL трактовать архитектурную трансформацию не как внутренний refactor backlog, а как product-facing change-линию, если она меняет рабочее место, контур кода/LLM или читаемость проектного и workflow-устройства.

#### Scenario: Release фиксирует старт архитектурной волны
- **WHEN** активный release собирает первые implement/fix changes этой линии
- **THEN** release описывает архитектурную трансформацию как product-facing волну
- **AND** не сводит её к техническому контейнеру без пользовательского смысла

#### Scenario: Release остаётся живым контейнером архитектурной волны
- **WHEN** новые user-facing project changes относятся к той же архитектурной линии
- **THEN** они MAY входить в тот же active release через `release_ref`
- **AND** tactical ownership и `parent_change` этих changes не переписываются ради релизной принадлежности

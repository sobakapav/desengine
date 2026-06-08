## MODIFIED Requirements

### Requirement: Controlled performance verdicts выражаются как reusable contract

Система SHALL позволять тестовому слою выражать controlled speed-path verdicts для user-facing сценариев `npm run start` без live/provider нестабильности.

#### Scenario: Разработчик проверяет controlled speed-path против performance budget

- **WHEN** разработчик запускает unit- или contract-проверку speed-path на fixture/mocked измерениях
- **THEN** тестовый слой возвращает явный verdict `ok`, `regression` или `budget-exceeded`
- **AND** verdict использует reusable contract c baseline, budget и controlled samples

#### Scenario: Одиночный шумовой spike не считается speed regression

- **WHEN** один из controlled samples резко медленнее baseline, но representative duration остаётся внутри noise threshold
- **THEN** verdict остаётся `ok`
- **AND** тестовый слой не подменяет speed regression единичным infra noise

## ADDED Requirements

### Requirement: Storage adapter обслуживает portable project contract

Система SHALL использовать storage boundary не только для локального persistence, но и для import/export переносимого project contract.

#### Scenario: Runtime экспортирует manifest через adapter boundary
- **WHEN** система формирует project manifest
- **THEN** она читает project-owned данные через storage adapter
- **AND** внешний manifest не зависит от знания browser-local storage keys

#### Scenario: Runtime импортирует manifest через adapter boundary
- **WHEN** пользователь загружает manifest проекта
- **THEN** storage adapter принимает portable project contract и переводит его в canonical project state
- **AND** смена backend хранения не требует переписывать сам пользовательский import/export contract

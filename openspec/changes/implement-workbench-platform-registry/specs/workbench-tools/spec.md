## ADDED Requirements

### Requirement: Инструменты Workbench подключаются через registry

Система SHALL подключать инструменты рабочего стола через общий registry и tool contract.

#### Scenario: Добавляется новый локальный tool
- **WHEN** команда добавляет image/layout/tool capability
- **THEN** tool получает id, title, applicability и state contract
- **AND** не требует локального хака в конкретном Workbench component

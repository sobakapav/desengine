## MODIFIED Requirements

### Requirement: Инструменты Workbench подключаются через registry

Система SHALL подключать инструменты рабочего стола через общий registry и tool contract.

#### Scenario: Workbench tool фиксирует sourcing decision
- **WHEN** registry содержит Workbench tool
- **THEN** tool содержит sourcing decision `reuse`, `adapt` или `build`
- **AND** decision указывает primitive, owner boundary, adapter policy, fallback/degradation strategy и test level
- **AND** Sandpack и Monaco оформлены как `adapt`, а текущие lab controls не добавляют новую dependency

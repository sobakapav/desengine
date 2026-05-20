## Requirements

### Requirement: Инструменты Workbench подключаются через registry

Система SHALL подключать инструменты рабочего стола через общий registry и tool contract.

#### Scenario: Добавляется новый локальный tool
- **WHEN** команда добавляет image/layout/tool capability
- **THEN** tool получает id, title, applicability и state contract
- **AND** не требует локального хака в конкретном Workbench component

#### Scenario: Workbench tool фиксирует sourcing decision
- **WHEN** registry содержит Workbench tool
- **THEN** tool содержит sourcing decision `reuse`, `adapt` или `build`
- **AND** decision указывает primitive, owner boundary, adapter policy и test level
- **AND** Sandpack и Monaco оформлены как `adapt`, а текущие lab controls не добавляют новую dependency

#### Scenario: Tool state сериализуется отдельно от component runtime
- **WHEN** runtime сериализует состояние инструментов Workbench
- **THEN** каждый tool state содержит `toolId`, `version` и JSON-сериализуемый `value`
- **AND** API Sandpack, Monaco или локальных controls не протекает в serialized state

## Requirements

### Requirement: Инструменты рабочего пространства подключаются через registry

Система SHALL подключать инструменты рабочего пространства через общий registry и tool contract.

#### Scenario: Добавляется новый локальный tool
- **WHEN** команда добавляет image/layout/tool capability
- **THEN** tool получает id, title, applicability и state contract
- **AND** не требует локального хака в конкретном project/workflow surface

#### Scenario: Workspace tool фиксирует sourcing decision
- **WHEN** registry содержит workspace tool
- **THEN** tool содержит sourcing decision `reuse`, `adapt` или `build`
- **AND** decision указывает primitive, owner boundary, adapter policy, fallback/degradation strategy и test level
- **AND** адаптеры preview и editor оформлены как `adapt` и не тянут legacy-зависимости продукта

#### Scenario: Tool state сериализуется отдельно от component runtime
- **WHEN** runtime сериализует состояние инструментов рабочего пространства
- **THEN** каждый tool state содержит `toolId`, `version` и JSON-сериализуемый `value`
- **AND** API конкретных инструментов не протекает в serialized state

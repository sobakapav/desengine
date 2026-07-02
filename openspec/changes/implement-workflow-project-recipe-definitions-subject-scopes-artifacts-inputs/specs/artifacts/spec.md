## MODIFIED Requirements

### Requirement: Artifacts являются явным пользовательским слоем проекта

Система SHALL позволять workflow definitions и steps объявлять artifact slots как входные и выходные контракты.

#### Scenario: Workflow definition объявляет required artifacts
- **WHEN** система публикует `WorkflowDefinition`
- **THEN** definition явно указывает, какие artifacts или input slots обязательны для запуска
- **AND** пользователь и runtime понимают, чего не хватает для начала работы

#### Scenario: Workflow step производит ожидаемые artifacts
- **WHEN** workflow step завершается
- **THEN** система знает, какие output artifacts он должен оставить
- **AND** эти outputs принадлежат contract шага, а не случайным побочным эффектам

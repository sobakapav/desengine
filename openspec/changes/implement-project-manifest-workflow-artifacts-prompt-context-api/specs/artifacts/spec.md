## ADDED Requirements

### Requirement: Artifacts являются явным пользовательским слоем проекта

Система SHALL показывать artifacts как project-owned материалы работы, а не только как внутренние runtime outputs.

#### Scenario: Пользователь видит artifacts проекта
- **WHEN** пользователь открывает artifact layer проекта
- **THEN** система показывает набор входных и выходных материалов проекта
- **AND** каждый artifact привязан к проекту, компоненту или workflow-контексту

#### Scenario: Manifest включает сводку artifacts
- **WHEN** система экспортирует project manifest
- **THEN** manifest включает artifact summary проекта
- **AND** эта сводка помогает понять состав проектной работы вне текущего браузерного runtime

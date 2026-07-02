## MODIFIED Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать workflow не только как последовательность шагов, но и как reusable тип проектной операции.

#### Scenario: Workflow definition описывает тип проектной операции
- **WHEN** система публикует workflow в product-facing или runtime-facing каталоге
- **THEN** он представлен через `WorkflowDefinition`
- **AND** definition содержит `operationFamily`, `subjectKinds`, `requiredInputs`, `producedArtifacts` и `stepDefinitions`
- **AND** workflow не сводится к одному жёстко зашитому recipe проекта

#### Scenario: Workflow run принадлежит проекту и конкретному предмету работы
- **WHEN** пользователь запускает workflow
- **THEN** система создаёт `WorkflowRun` внутри проекта
- **AND** run явно знает свой `subject`
- **AND** subject может быть не только `component`, но и `screen`, `data-set`, `domain-model`, `storybook-layer` или другим допустимым scope

#### Scenario: Workflow step знает входы и выходы
- **WHEN** runtime строит `WorkflowStepDefinition`
- **THEN** шаг объявляет, какие inputs и artifacts ему нужны
- **AND** шаг объявляет, какие результаты он должен произвести
- **AND** эти contracts не скрываются в неявной логике UI или prompt builder

### Requirement: Workflow поддерживает разные subject scopes

Система SHALL позволять workflow работать над разными предметами проектной работы, а не только над одним компонентом.

#### Scenario: Workflow запускается над экраном
- **WHEN** пользователь открывает карту экранов или экранный контекст проекта
- **THEN** система может запустить workflow с `subjectKind = screen` или `screen-set`
- **AND** workflow не требует маскировать экран под компонент

#### Scenario: Workflow запускается над данными или доменной моделью
- **WHEN** пользователь прорабатывает mock-данные или доменную модель
- **THEN** система может запустить workflow с `subjectKind = data-set` или `domain-model`
- **AND** data/domain работа не считается внешней по отношению к продуктовой модели workflow

### Requirement: Workflow поддерживает разные точки входа

Система SHALL позволять одному каталогу workflow запускаться из разных project-facing поверхностей.

#### Scenario: Workflow definition объявляет допустимые entry surfaces
- **WHEN** система публикует definition в каталоге workflow
- **THEN** definition содержит список допустимых entry surfaces
- **AND** среди них могут быть project page, component card, screen map, data layer, Storybook layer и import surfaces

#### Scenario: Workflow из разных поверхностей остаётся одним и тем же contract
- **WHEN** пользователь запускает одну и ту же operation family из разных поверхностей
- **THEN** система использует один и тот же `WorkflowDefinition`
- **AND** различается только `subject`, входы и bindings конкретного run

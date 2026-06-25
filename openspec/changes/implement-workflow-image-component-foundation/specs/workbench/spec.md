## MODIFIED Requirements

### Requirement: Runtime surface может показать текущий workflow step через Workbench

#### Scenario: Workbench materializes coordinator step вместо уровня
- **WHEN** пользователь открывает текущую рабочую поверхность image-to-component задачи
- **THEN** surface связывает Workbench с coordinator step `Работаем над workflow`
- **AND** пользовательская модель читает Workbench как рабочую поверхность workflow целиком
- **AND** каталог workflow points остаётся частью workflow surface, а не отдельным hidden state внутри Workbench

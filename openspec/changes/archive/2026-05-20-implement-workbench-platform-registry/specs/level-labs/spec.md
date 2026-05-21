## MODIFIED Requirements

### Requirement: Текущая лаборатория является Workbench profile

Система SHALL описывать текущую лабораторию компонента как первый profile общей Workbench platform без заметного изменения пользовательского UX.

#### Scenario: Lab workbench использует platform registry
- **WHEN** runtime описывает текущую лабораторию компонента
- **THEN** используется profile `level-lab` и definition `lab-component-workbench`
- **AND** редактор Monaco, Sandpack preview, prompt composer и lab controls подключены как tools registry
- **AND** текущие controls не требуют новой runtime dependency

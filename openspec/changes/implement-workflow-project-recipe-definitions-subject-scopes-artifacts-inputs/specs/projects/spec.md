## MODIFIED Requirements

### Requirement: Проект показывает workflow как наблюдаемый слой

Система SHALL позволять проекту не только показывать текущий workflow readout, но и постепенно становиться точкой входа в каталог workflow-операций.

#### Scenario: Проект связывает workflow с разными subject surfaces
- **WHEN** пользователь работает с компонентами, экранами, данными или другими project-owned слоями
- **THEN** проектная поверхность может запускать подходящий workflow из соответствующего subject context
- **AND** workflow не ограничен только карточкой одного компонента

#### Scenario: Проект не считает один recipe единственной формой workflow
- **WHEN** система описывает доступные workflow проекта
- **THEN** она не ограничивается одним `project-design-workflow`
- **AND** проект может иметь несколько definitions или bindings для разных типов работы

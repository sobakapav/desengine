## ADDED Requirements

### Requirement: Packaging не стартует до storage readiness

Система разработки SHALL запускать packaging implementation только после стабилизации project/task/artifact/event storage boundaries.

#### Scenario: Команда планирует Electron или cloud packaging
- **WHEN** packaging change переходит из planning в behavior implementation
- **THEN** dispatcher проверяет storage readiness prerequisites
- **AND** secrets policy отделена от project/event storage

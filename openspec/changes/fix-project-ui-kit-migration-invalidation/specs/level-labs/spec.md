## ADDED Requirements

### Requirement: Лаборатория показывает migration status project UI kit

Система SHALL показывать пользователю явный migration status после смены project `UI kit`, если это влияет на текущую задачу или workbench.

#### Scenario: Текущая лаборатория попала под project migration
- **WHEN** пользователь меняет `project.settings.uiKitId`
- **AND** текущая задача или preview требуют compatibility re-check
- **THEN** лаборатория показывает явный migration status
- **AND** не продолжает молча работать на устаревшем project contract

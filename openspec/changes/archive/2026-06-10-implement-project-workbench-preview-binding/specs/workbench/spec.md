## MODIFIED Requirements

### Requirement: WorkbenchInstance строится внутри project contract

#### Scenario: WorkbenchInstance строится внутри active project
- **WHEN** runtime строит projection текущего рабочего верстака
- **THEN** он создаёт `WorkbenchInstance` с тем же `projectId`, что и active project context
- **AND** workbench input contract читает project settings как часть project boundary

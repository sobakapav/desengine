## Requirements

### Requirement: Artifact является общим контейнером входов и выходов

Система SHALL описывать code files, prompt entries, workflow snapshots, images и imported assets через единый `Artifact` contract.

#### Scenario: Рабочий файл проекта становится code artifact
- **WHEN** project runtime читает текущий набор файлов компонента
- **THEN** каждый рабочий файл может быть представлен как Artifact kind `code-file`
- **AND** artifact связан с project/component/workflow step context
- **AND** runtime не создаёт второй независимый список тех же файлов

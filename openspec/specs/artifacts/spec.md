## Requirements

### Requirement: Artifact является общим контейнером входов и выходов

Система SHALL описывать code files, prompt entries, check-results, images и imported assets через единый `Artifact` contract.

#### Scenario: Рабочий файл становится code artifact
- **WHEN** lab runtime читает `TaskData.contentByFileId`
- **THEN** каждый текущий рабочий файл может быть представлен как Artifact kind `code-file`
- **AND** artifact связан с project/task/workflow step context
- **AND** projection не создаёт второй независимый список файлов

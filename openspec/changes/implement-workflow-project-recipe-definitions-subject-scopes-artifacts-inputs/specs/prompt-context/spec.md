## MODIFIED Requirements

### Requirement: PromptContext является общим входом LLM flows

Система SHALL строить PromptContext не только из project/component/step, но и из workflow definition, subject и input/output bindings.

#### Scenario: PromptContext знает definition и subject workflow
- **WHEN** LLM flow строит PromptContext для workflow run
- **THEN** context содержит `workflow.definition`, `workflow.subject` и активный `workflowStep`
- **AND** prompt builder понимает, над каким типом операции и над каким предметом работы идёт генерация

#### Scenario: PromptContext знает workflow inputs и artifact bindings
- **WHEN** workflow использует изображения, Figma JSON, текстовые сценарии, mock-данные или другие входы
- **THEN** PromptContext умеет включать эти bindings как часть canonical context
- **AND** данные и доменная модель не считаются внешними по отношению к prompt boundary

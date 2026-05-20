## ADDED Requirements

### Requirement: PromptContext является общим входом LLM flows

Система SHALL собирать project/task/workflow/artifact/workbench данные в единый PromptContext перед генерацией prompt.

#### Scenario: Iterate flow строит context через общий builder
- **WHEN** пользователь запускает уточняющий prompt
- **THEN** service получает PromptContext из общего builder
- **AND** context содержит project, task, workflow step, artifacts и пользовательский текст

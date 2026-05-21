## MODIFIED Requirements

### Requirement: PromptContext является общим входом LLM flows

Система SHALL собирать project/task/workflow/artifact/workbench данные в единый PromptContext перед генерацией prompt.

PromptContext SHALL содержать:
- `project`;
- `task`;
- текущий `workflowStep`;
- `artifacts`;
- `workbench`, если он связан с текущим workflow step;
- `userText`, если flow содержит пользовательский текст;
- `constraints`;
- `providerCapabilities`;
- template-compatible `renderContext` для legacy Nunjucks prompt templates.

#### Scenario: Iterate flow строит context через общий builder
- **WHEN** пользователь запускает уточняющий prompt
- **THEN** service получает PromptContext из общего builder
- **AND** context содержит project, task, workflow step, artifacts и пользовательский текст

#### Scenario: Builder включает workbench и provider capabilities
- **WHEN** LLM flow строит PromptContext из task projection
- **THEN** context содержит WorkbenchInstance текущего workflow step
- **AND** context содержит constraints и providerCapabilities текущего runtime-запроса

#### Scenario: Legacy prompt templates получают совместимый renderContext
- **WHEN** downstream consumer рендерит Nunjucks prompt template
- **THEN** он использует `PromptContext.renderContext`
- **AND** template context сохраняет поля `user`, `task`, `level` и `project`

### Requirement: Downstream prompt consumers зависят от PromptContext boundary

Система SHALL считать PromptContext canonical input для prompt-related consumers `task-hints-templating` и `prompt-builder`.

#### Scenario: Task hints templating использует PromptContext-compatible context
- **WHEN** runtime рендерит шаблонную подсказку уровня
- **THEN** template получает context через PromptContext boundary или его renderContext adapter

#### Scenario: Prompt builder получает canonical input
- **WHEN** prompt-builder формирует prompt-related runtime output
- **THEN** его входной контракт основан на PromptContext, а не на отдельной ad-hoc модели task/level/files

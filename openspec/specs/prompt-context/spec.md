# PromptContext

## Purpose

Зафиксировать единый runtime contract для prompt-related flows, чтобы LLM и будущий prompt builder использовали одну модель project/component/workflow/artifact context.

## Requirements

### Requirement: PromptContext является общим входом LLM flows

Система SHALL собирать project/component/workflow/artifact данные в единый PromptContext перед генерацией prompt.

PromptContext SHALL содержать:
- `project`;
- `component`;
- текущий `workflowStep`;
- `artifacts`;
- `userText`, если flow содержит пользовательский текст;
- `constraints`;
- `providerCapabilities`;
- template-compatible `renderContext` для downstream prompt consumers.

#### Scenario: Iterate flow строит context через общий builder
- **WHEN** пользователь запускает уточняющий prompt
- **THEN** service получает PromptContext из общего builder
- **AND** context содержит project, component, workflow step, artifacts и пользовательский текст

#### Scenario: Builder включает project/component/workflow/artifacts
- **WHEN** LLM flow строит PromptContext из project projection
- **THEN** context содержит project, component, текущий workflow step и artifacts

#### Scenario: Builder включает constraints и provider capabilities
- **WHEN** LLM flow строит PromptContext для runtime-запроса
- **THEN** context содержит constraints и providerCapabilities текущего запроса

#### Scenario: PromptContext включает фокус выбранного workflow-пункта
- **WHEN** runtime строит PromptContext для active file или выбранного workflow-пункта
- **THEN** context содержит явный `workflowPoint`
- **AND** template-compatible `renderContext.workflow` сохраняет `focusPointId`, `focusPointTitle` и `primaryFileId`

#### Scenario: Legacy prompt templates получают совместимый renderContext
- **WHEN** downstream consumer рендерит Nunjucks prompt template
- **THEN** он использует `PromptContext.renderContext`
- **AND** template context сохраняет поля `user`, `component`, `workflowStep` и `project`

### Requirement: Downstream prompt consumers зависят от PromptContext boundary

Система SHALL считать PromptContext canonical input для downstream prompt consumers и `prompt-builder`.

#### Scenario: Prompt consumer использует PromptContext-compatible context
- **WHEN** runtime рендерит prompt-related шаблон или сборщик
- **THEN** consumer получает context через PromptContext boundary или его renderContext adapter

#### Scenario: Prompt builder получает canonical input
- **WHEN** prompt-builder формирует prompt-related runtime output
- **THEN** его входной контракт основан на PromptContext, а не на отдельной ad-hoc модели component/step/files

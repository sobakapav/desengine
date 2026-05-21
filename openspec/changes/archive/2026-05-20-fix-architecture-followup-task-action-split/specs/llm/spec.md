## MODIFIED Requirements

### Requirement: LLM flows используют PromptContext boundary

Start, iterate и check LLM flows SHALL строить PromptContext через общий builder до сборки итоговой инструкции.

#### Scenario: Система выполняет start
- **WHEN** runtime запускает LLM start-flow
- **THEN** start-flow строит PromptContext через общий builder до prompt instruction
- **AND** декомпозиция helper-модулей не меняет LLM prompt templates, image context и allowed files context

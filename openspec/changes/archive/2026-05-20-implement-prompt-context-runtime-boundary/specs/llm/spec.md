## MODIFIED Requirements

### Requirement: Общий базовый промпт участвует во всех LLM-запросах

Система SHALL использовать единый базовый prompt `default` и при инициирующем запуске, и при уточняющих итерациях.

Start, iterate и check LLM flows SHALL строить PromptContext через общий builder до сборки итоговой инструкции.

#### Scenario: Система выполняет start
- **WHEN** система формирует инициирующий LLM-запрос
- **THEN** она включает общий базовый prompt `default`
- **AND** использует PromptContext с project, task, workflow step, artifacts, workbench, constraints и provider capabilities

#### Scenario: Система выполняет iterate
- **WHEN** система формирует уточняющий LLM-запрос
- **THEN** она включает общий базовый prompt `default`
- **AND** использует PromptContext с userText текущего уточнения

#### Scenario: Система выполняет check
- **WHEN** система формирует LLM-запрос проверки уровня
- **THEN** она использует PromptContext и передаёт legacy hidden prompt templates совместимый `renderContext`

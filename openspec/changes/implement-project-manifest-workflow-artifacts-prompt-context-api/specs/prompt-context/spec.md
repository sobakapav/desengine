## ADDED Requirements

### Requirement: PromptContext показывает и принимает project-owned brief

Система SHALL включать в canonical prompt context редактируемый project-owned brief.

#### Scenario: Пользователь редактирует brief проекта
- **WHEN** пользователь меняет prompt brief на странице проекта
- **THEN** система сохраняет это значение как часть project-owned контекста
- **AND** downstream prompt builders читают его из общего canonical PromptContext boundary

#### Scenario: Brief не существует только как текст UI
- **WHEN** проект использует prompt brief
- **THEN** brief входит в manifest и project API
- **AND** не остаётся локальным непрозрачным текстом только внутри одного компонента UI

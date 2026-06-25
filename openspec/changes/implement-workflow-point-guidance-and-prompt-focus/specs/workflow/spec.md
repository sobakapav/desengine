## MODIFIED Requirements

### Requirement: Workflow-point focus влияет на production guidance

Система SHALL использовать выбранный workflow-пункт как содержательный фокус user guidance и prompt-building, а не только как локальное переключение файла.

#### Scenario: Task hint templating получает selected workflow point
- **WHEN** пользователь открывает task hint для workflow-сессии
- **AND** active screen соответствует workflow-пункту
- **THEN** template context содержит идентификатор, заголовок и primary file выбранного workflow-пункта
- **AND** hint может адаптировать текст под текущий артефакт

#### Scenario: Start и iterate prompt-building получают selected workflow point
- **WHEN** runtime строит production prompt для `start` или `iterate`
- **AND** active screen соответствует workflow-пункту
- **THEN** PromptContext содержит selected workflow point
- **AND** production guidance приоритизирует догенерацию артефакта этого workflow-пункта
- **AND** runtime не запрещает сопутствующие изменения в соседних файлах, если они нужны для целостного результата

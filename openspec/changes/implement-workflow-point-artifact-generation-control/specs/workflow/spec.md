## MODIFIED Requirements

### Requirement: Workflow-point focus влияет на production guidance

Система SHALL использовать выбранный workflow-пункт как содержательный фокус user guidance и prompt-building, а не только как локальное переключение файла.

#### Scenario: Start и iterate generation управляются выбранным workflow-пунктом
- **WHEN** runtime строит production prompt для `start` или `iterate`
- **AND** active screen соответствует workflow-пункту
- **THEN** selected workflow-point ограничивает primary file set этой генерации
- **AND** supporting files остаются доступными как контекст
- **AND** пользователь может целенаправленно догенерировать артефакт выбранного workflow-пункта

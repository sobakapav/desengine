## MODIFIED Requirements

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL позволять не только наблюдать workflow на странице проекта, но и запускать работу над workflow из `ProjectComponent`.

#### Scenario: Пользователь запускает workflow из компонента проекта
- **WHEN** пользователь открывает `/projects/<projectId>`
- **AND** у проекта есть `ProjectComponent`
- **AND** пользователь выбирает действие `Работать над компонентом`
- **THEN** система назначает или переиспользует `backing task` для этого компонента
- **AND** запускает существующий `image-to-component` workflow в контексте выбранного проекта
- **AND** переводит пользователя в рабочую workflow-сессию этого компонента

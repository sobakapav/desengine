## MODIFIED Requirements

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL давать read-only доступ к project-aware workflow/artifact surface без изменения underlying orchestration и использовать этот readout для project-facing навигации по компонентам.

#### Scenario: Пользователь видит project-aware artifacts и bindings
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит project-aware artifacts и runtime bindings
- **AND** пользователь видит workflow-run как наблюдаемую сущность с пунктами и последней активностью
- **AND** readout не требует редактирования workflow для понимания текущего состояния

#### Scenario: Start и iterate generation управляются выбранным workflow-пунктом
- **WHEN** runtime строит production prompt для `start` или `iterate`
- **AND** active screen соответствует workflow-пункту
- **THEN** selected workflow-point ограничивает primary file set этой генерации
- **AND** supporting files остаются доступными как контекст

#### Scenario: Пользователь запускает workflow из компонента проекта
- **WHEN** пользователь открывает `/projects/<projectId>`
- **AND** у проекта есть `ProjectComponent`
- **AND** пользователь выбирает действие `Работать над компонентом`
- **THEN** система назначает или переиспользует `backing task` для этого компонента
- **AND** запускает существующий `image-to-component` workflow в контексте выбранного проекта
- **AND** переводит пользователя в рабочую workflow-сессию этого компонента

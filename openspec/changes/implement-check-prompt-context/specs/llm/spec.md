## MODIFIED Requirements

### Requirement: Level-specific prompts читаются из скрытого onboarding prompt-слоя

Система SHALL рендерить hidden checking prompt уровня с project-aware context, чтобы шаблон мог учитывать текущий режим и выбранную дизайн-систему проекта.

#### Scenario: Система рендерит hidden checking prompt уровня с project-aware context
- **WHEN** runtime подбирает `check.njk` для текущего уровня задачи
- **THEN** он рендерит шаблон через общий prompt-template runtime
- **AND** template context содержит `user`, `project`, `task` и `level`

#### Scenario: Система передаёт в check prompt название выбранной дизайн-системы
- **WHEN** пользователь запускает проверку уровня при выбранном UI kit проекта
- **THEN** hidden `check.njk` может использовать `{{ user.designSystemName }}`

#### Scenario: Система использует effective UI kit для hidden check prompt
- **WHEN** проект работает в режиме `html-tags`
- **THEN** template context содержит effective UI kit runtime, а не только исходный `project.uiKitId`

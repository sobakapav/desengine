## MODIFIED Requirements

### Requirement: Hidden checking prompt уровня является optional onboarding-контентом

Система SHALL разрешать автору hidden checking prompt использовать project-aware переменные шаблона, если prompt рендерится в runtime конкретной задачи.

#### Scenario: Автор check prompt использует user/project переменные
- **WHEN** автор пишет `onboarding/prompts/levels/<levelId>/check.njk`
- **THEN** он может использовать `user.designSystemName`, `project.uiKitTitle` и связанные поля текущего project context

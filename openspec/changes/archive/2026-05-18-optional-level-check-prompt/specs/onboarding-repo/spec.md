## MODIFIED Requirements

### Requirement: Onboarding-контент собирается под единым корнем `/onboarding`

Система SHALL хранить optional hidden checking prompts уровней под путём `onboarding/prompts/levels/<levelId>/check.md`.

#### Scenario: Автор onboarding-уровня добавляет prompt проверки
- **WHEN** уровню нужны дополнительные скрытые требования проверки
- **THEN** автор может добавить файл `onboarding/prompts/levels/<levelId>/check.md`

#### Scenario: Автор onboarding-уровня не добавляет prompt проверки
- **WHEN** уровню не нужны дополнительные скрытые требования проверки
- **THEN** файл `onboarding/prompts/levels/<levelId>/check.md` может отсутствовать
- **AND** runtime продолжает проверку уровня без дополнительной level-specific checking части

## MODIFIED Requirements

### Requirement: Level-specific prompts читаются из скрытого onboarding prompt-слоя

Система SHALL читать level-specific prompts класса `start`, `iterate` и `check` из скрытого onboarding prompt-слоя.

#### Scenario: Система выполняет checking prompt lookup для уровня
- **WHEN** runtime подбирает hidden prompt проверки уровня
- **THEN** он ищет `onboarding/prompts/levels/<levelId>/check.md`
- **AND** если файл существует, включает его содержимое в checking instruction

#### Scenario: Hidden prompt проверки уровня отсутствует
- **WHEN** runtime подбирает hidden prompt проверки уровня
- **AND** `onboarding/prompts/levels/<levelId>/check.md` отсутствует
- **THEN** runtime использует пустой level-specific checking prompt
- **AND** не считает отсутствие файла технической ошибкой проверки

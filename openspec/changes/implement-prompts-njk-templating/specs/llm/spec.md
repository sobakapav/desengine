## MODIFIED Requirements

### Requirement: Level-specific prompts читаются из скрытого onboarding prompt-слоя

Система SHALL рендерить level-specific prompts hidden onboarding-слоя через общий prompt-template runtime и поддерживать `njk` как канонический формат prompt-файлов.

#### Scenario: Система рендерит start prompt уровня через общий template runtime
- **WHEN** runtime подбирает `start` prompt уровня
- **THEN** он читает `onboarding/prompts/levels/<levelId>/start.njk`
- **AND** рендерит его через общий runtime prompt templates

#### Scenario: Система передаёт в шаблон формализованный prompt context
- **WHEN** runtime рендерит level-specific prompt
- **THEN** template context содержит данные уровня
- **AND** может включать task/project/user данные, если они доступны в runtime

#### Scenario: Optional prompt деградирует без падения уровня
- **WHEN** optional prompt `iterate.njk` или `check.njk` отсутствует либо содержит template-ошибку
- **THEN** runtime использует совместимый fallback
- **AND** не роняет весь сценарий уровня только из-за optional prompt

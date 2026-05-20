## MODIFIED Requirements

### Requirement: Level-specific prompts читаются из скрытого onboarding prompt-слоя

Система SHALL рассматривать level-specific prompts как шаблоны hidden prompt-слоя и рендерить их через единый prompt-template runtime.

#### Scenario: Система рендерит start prompt уровня через общий template runtime
- **WHEN** runtime подбирает hidden start prompt уровня
- **THEN** он читает `onboarding/prompts/levels/<levelId>/start.njk`
- **AND** рендерит его через общий runtime prompt templates

#### Scenario: Система передаёт в шаблон формализованный prompt context
- **WHEN** runtime рендерит level-specific prompt
- **THEN** template context содержит данные уровня
- **AND** может быть расширен task/project/user данными без смены формата prompt-файлов

#### Scenario: Optional prompt деградирует без падения уровня
- **WHEN** optional prompt `iterate.njk` или `check.njk` отсутствует либо не рендерится
- **THEN** runtime использует предсказуемый fallback
- **AND** не считает это фатальной ошибкой для всего level runtime

## MODIFIED Requirements

### Requirement: Hidden checking prompt уровня является optional onboarding-контентом

Система SHALL хранить hidden onboarding prompts в формате `njk` и разрешать авторам использовать shared prompt templates без смены структуры prompt-слоя.

#### Scenario: Автор onboarding-уровня добавляет prompt как njk-шаблон
- **WHEN** для уровня создаётся hidden prompt `start`, `iterate` или `check`
- **THEN** автор сохраняет его по пути `onboarding/prompts/levels/<levelId>/<kind>.njk`

#### Scenario: Автор выносит общие части в shared partials
- **WHEN** нескольким prompts нужен общий текст или layout
- **THEN** автор может подключать shared `njk` partials/base templates из prompt-слоя

#### Scenario: Во время миграции рядом остаётся legacy prompt
- **WHEN** исторический onboarding prompt ещё не переведён в новый формат
- **THEN** рядом может временно существовать legacy `.md`
- **AND** новые изменения в prompt-слое оформляются в `njk`

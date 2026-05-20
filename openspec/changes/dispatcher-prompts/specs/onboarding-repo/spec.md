## MODIFIED Requirements

### Requirement: Hidden checking prompt уровня является optional onboarding-контентом

Система SHALL описывать onboarding prompt-слой как шаблонный контент на базе `njk`, совместимый с общим prompt-template runtime.

#### Scenario: Автор onboarding-уровня добавляет prompt как njk-шаблон
- **WHEN** уровню нужен hidden prompt `start`, `iterate` или `check`
- **THEN** автор хранит его как `onboarding/prompts/levels/<levelId>/<kind>.njk`

#### Scenario: Автор выносит общие части в shared partials
- **WHEN** несколько level-specific prompts разделяют общий текст или правила
- **THEN** автор может вынести их в shared `njk` partials/base templates prompt-слоя

#### Scenario: Во время миграции рядом остаётся legacy prompt
- **WHEN** часть onboarding-контента ещё не переведена на новый формат
- **THEN** репозиторий может временно хранить legacy prompt рядом с каноническим `njk`-шаблоном
- **AND** каноническим форматом для новых изменений остаётся `njk`

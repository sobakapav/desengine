## MODIFIED Requirements

### Requirement: Lab-flow проверяется без live credentials

Система SHALL иметь воспроизводимую проверку ключевого lab-flow или его service-level эквивалента без реальных LLM credentials.

#### Scenario: Разработчик проверяет lab runtime после hardening
- **WHEN** разработчик запускает обязательную проверку change
- **THEN** lab-flow проверяется на mock LLM или fixture service данных
- **AND** команда не требует live provider credentials

#### Scenario: Проверка использует временное пользовательское состояние
- **WHEN** тест lab-flow записывает task files, progress или check-result
- **THEN** он использует temp/fixture storage или полностью замоканный service boundary
- **AND** тест не оставляет изменение пользовательских данных после завершения

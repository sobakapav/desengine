## MODIFIED Requirements

### Requirement: Тесты трассируются к OpenSpec scenarios

Система SHALL поддерживать проверяемую связь между тестовыми файлами и сценариями из `openspec/specs/**`.

#### Scenario: Тестовый файл покрывает OpenSpec-сценарий

- **WHEN** тестовый файл содержит metadata связи со spec
- **THEN** metadata указывает существующий capability из `openspec/specs/<capability>/spec.md`
- **AND** metadata ссылается на существующие `#### Scenario:` этого capability

#### Scenario: Capability временно не имеет полного покрытия

- **WHEN** существующий spec ещё не покрыт обязательным набором тестов
- **THEN** отсутствие покрытия явно зафиксировано в coverage-plan или allowlist
- **AND** эта запись объясняет причину и этап закрытия

#### Scenario: Добавляется capability с quality-правилами читаемости

- **WHEN** в OpenSpec добавляется capability, который задаёт quality-правила кода (например, `code-readability`)
- **THEN** для capability существует минимум один runnable-путь проверки в едином тестовом слое (static/contract или unit)
- **AND** `npm run test:traceability` валидирует связь его scenario с тестами или coverage-plan

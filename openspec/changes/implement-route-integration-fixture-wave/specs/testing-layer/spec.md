## MODIFIED Requirements

### Requirement: Lab-flow проверяется без live credentials

#### Scenario: Integration-слой покрывает route handlers через fixture boundary
- **WHEN** разработчик запускает integration-проверку task и support route handlers
- **THEN** тесты проходят через реальные route handlers, request/params parsing и HTTP response mapping
- **AND** runtime/service зависимости подменяются fixture или stub boundary без live provider credentials
- **AND** тест не оставляет изменения в рабочем пользовательском состоянии

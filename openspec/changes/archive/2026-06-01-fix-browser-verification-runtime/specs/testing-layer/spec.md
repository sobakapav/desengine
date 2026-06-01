## MODIFIED Requirements

### Requirement: Обязательные тесты воспроизводимы без внешних секретов

#### Scenario: Разработчик запускает browser verification preflight

- **WHEN** разработчик явно запускает browser verification preflight для e2e слоя
- **THEN** система сначала проверяет доступность target server
- **AND** отдельно проверяет, что Chromium открывает базовый route
- **AND** infra failure не маскируется под product regression

## MODIFIED Requirements

### Requirement: Система предоставляет единый тестовый слой

#### Scenario: Разработчик запускает integration-проверку server/API-flow

- **WHEN** разработчик выполняет `npm run test:integration`
- **THEN** система запускает отдельный integration-слой для route handlers и server/API-flow на mock/fixture-данных
- **AND** команда не поднимает браузер и не требует `next dev`
- **AND** live/provider credentials не требуются

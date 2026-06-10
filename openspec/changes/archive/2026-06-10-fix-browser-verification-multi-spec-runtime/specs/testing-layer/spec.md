## MODIFIED Requirements

### Requirement: Обязательные тесты воспроизводимы без внешних секретов

Система SHALL запускать обязательный тестовый слой на детерминированных fixtures/mock-данных без доступа к реальным внешним сервисам.

#### Scenario: Credentials не заданы

- **WHEN** разработчик запускает обязательные test/full-команды без live credentials
- **THEN** обязательные проверки используют mock/fixture-режим
- **AND** отсутствие live credentials не ломает обязательный прогон

#### Scenario: Разработчик запускает live/provider-проверку

- **WHEN** разработчик явно запускает live/provider-команду
- **THEN** система читает credentials только из env или локальных некоммитимых файлов
- **AND** при отсутствии нужных переменных показывает понятную диагностику

#### Scenario: Разработчик запускает browser verification preflight

- **WHEN** разработчик явно запускает browser verification preflight для e2e слоя
- **THEN** система сначала проверяет доступность target server
- **AND** отдельно проверяет, что Chromium открывает базовый route
- **AND** wrapper передаёт в Playwright все переданные `.spec.ts` аргументы, а не только первый
- **AND** infra failure не маскируется под product regression

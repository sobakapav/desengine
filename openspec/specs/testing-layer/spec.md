# Тестовый слой

## Purpose

Зафиксировать единый слой тестирования desengine: команды запуска, связь тестов с OpenSpec, правила mock/fixture/live-проверок и постепенное развитие покрытия без блокировки runtime.
## Requirements
### Requirement: Система предоставляет единый тестовый слой

Система SHALL предоставлять отдельный тестовый слой с документированными командами запуска для быстрого, полного, выборочного и live/provider-прогона.

#### Scenario: Разработчик запускает быстрый локальный тестовый слой

- **WHEN** разработчик выполняет каноническую быструю test-команду
- **THEN** система запускает быстрые автоматизированные проверки без реальных credentials
- **AND** команда не требует ручного кликанья в браузере

#### Scenario: Разработчик запускает полный локальный тестовый слой

- **WHEN** разработчик выполняет каноническую full test-команду
- **THEN** система запускает обязательный runnable-слой текущего этапа: unit + strict traceability + readability
- **AND** интеграционные и e2e smoke-проверки не запускаются автоматически в составе `test:full`
- **AND** live/provider-проверки с реальными внешними сервисами не запускаются случайно

#### Scenario: Разработчик запускает явную smoke-проверку реального onboarding checkout

- **WHEN** разработчик выполняет `npm run test:onboarding:real`
- **THEN** система проверяет совместимость реального `/onboarding` checkout через текущий smoke/repair контракт
- **AND** команда не использует unit-фикстуры как доказательство готовности реального checkout
- **AND** при проблеме возвращает диагностику про `ONBOARDING_REPO_URL`, layout, source marker или результат repair

#### Scenario: Разработчик запускает проверки по capability

- **WHEN** разработчик указывает OpenSpec capability для выборочного запуска
- **THEN** система запускает проверки, связанные с этим capability, или печатает понятный placeholder, если слой ещё не реализован
- **AND** документация объясняет, как найти соответствующие тесты и spec-сценарии

#### Scenario: Разработчик запускает integration-проверку server/API-flow

- **WHEN** разработчик выполняет `npm run test:integration`
- **THEN** система запускает отдельный integration-слой для route handlers и server/API-flow на mock/fixture-данных
- **AND** команда не поднимает браузер и не требует `next dev`
- **AND** live/provider credentials не требуются

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

### Requirement: Foundation event-линия переиспользует общий harness

Система SHALL удерживать единый reusable test harness для foundation event-линии, чтобы downstream changes не создавали параллельные тестовые event shape и не дублировали базовые sink-fixtures.

#### Scenario: Foundation event-линия использует общий reusable harness

- **WHEN** downstream change добавляет новую проверку поверх `EventEnvelope`
- **THEN** он переиспользует общий surface builders/fixtures и contract helpers из foundation-линии
- **AND** не вводит второй локальный baseline для тех же scope/privacy/redaction инвариантов

#### Scenario: Runtime-boundary событий проверяется без storage через foundation harness

- **WHEN** команда проверяет общий runtime-boundary записи product events
- **THEN** проверка использует stub/no-op sink и foundation `EventEnvelope`
- **AND** storage, producer wiring и live credentials не требуются

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
- **AND** infra failure не маскируется под product regression

### Requirement: Развитие тестового слоя не блокирует runtime

Система SHALL позволять развивать тестовый слой поэтапно без изменения пользовательского runtime и install-critical инфраструктуры.

#### Scenario: Тестовый слой ещё покрывает не все specs

- **WHEN** часть существующих specs находится в coverage-plan
- **THEN** обычные команды разработки и runtime продолжают работать без зависимости от незавершённого покрытия
- **AND** строгие проверки применяются только к тем частям слоя, которые уже объявлены готовыми

#### Scenario: Добавляется новый behavior-change

- **WHEN** команда создаёт или реализует новый OpenSpec change
- **THEN** change содержит тестовую часть: уровень проверки, команду запуска, mock/live требования и связь с общим тестовым слоем
- **AND** если покрытие откладывается, это фиксируется в coverage-plan с причиной

### Requirement: Controlled performance verdicts выражаются как reusable contract

Система SHALL позволять тестовому слою выражать controlled speed-path verdicts для user-facing сценариев `npm run start` без live/provider нестабильности.

#### Scenario: Разработчик проверяет controlled speed-path против performance budget

- **WHEN** разработчик запускает unit- или contract-проверку speed-path на fixture/mocked измерениях
- **THEN** тестовый слой возвращает явный verdict `ok`, `regression` или `budget-exceeded`
- **AND** verdict использует reusable contract c baseline, budget и controlled samples

#### Scenario: Одиночный шумовой spike не считается speed regression

- **WHEN** один из controlled samples резко медленнее baseline, но representative duration остаётся внутри noise threshold
- **THEN** verdict остаётся `ok`
- **AND** тестовый слой не подменяет speed regression единичным infra noise

### Requirement: Speed/load regression harness переиспользуется между сценариями

Система SHALL держать reusable regression harness для speed/load линии `npm run start`, чтобы downstream checks не собирали локальные ad-hoc loops для cold/warm, repeated actions, overload и oversize веток.

#### Scenario: Reusable harness прогоняет cold/warm speed-path

- **WHEN** тестовый слой проверяет cold и warm вариант одного speed-path
- **THEN** harness прогоняет их через единый sample/verdict contract
- **AND** cold/warm различие выражается через machine-readable diagnostics, а не через ручной разбор логов

#### Scenario: Reusable harness прогоняет repeated preview rebuild

- **WHEN** тестовый слой прогоняет повторные rebuild preview payload
- **THEN** harness удерживает общий surface для repeated samples и итогового verdict
- **AND** repeated path не требует отдельной ad-hoc логики в каждом downstream тесте

#### Scenario: Reusable harness прогоняет repeated iterate/check path

- **WHEN** тестовый слой проверяет повторные `iterate` или `check`
- **THEN** harness читает единый response/diagnostics contract этих action-path'ов
- **AND** сценарий не требует live credentials и браузерной интеракции

#### Scenario: Reusable harness прогоняет overload backlog path

- **WHEN** тестовый слой воспроизводит queued или overload backlog path
- **THEN** harness фиксирует degradation/load сигнал через structured diagnostics
- **AND** queued path остаётся различимым относительно immediate path

#### Scenario: Reusable harness прогоняет oversized payload/output refusal

- **WHEN** тестовый слой проверяет oversized input или output refusal
- **THEN** harness ожидает bounded error response и structured refusal diagnostics
- **AND** oversized path не требует реального provider-call

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

#### Scenario: Integration-слой покрывает route handlers через fixture boundary
- **WHEN** разработчик запускает integration-проверку task и support route handlers
- **THEN** тесты проходят через реальные route handlers, request/params parsing и HTTP response mapping
- **AND** runtime/service зависимости подменяются fixture или stub boundary без live provider credentials
- **AND** тест не оставляет изменения в рабочем пользовательском состоянии

### Requirement: Downstream speed/load проверки читают единый runtime diagnostics contract

Система SHALL держать канонический runtime diagnostics contract для task actions и preview payload, чтобы verdict layer не собирал ad-hoc speed/load сигналы из разноформатных логов.

#### Scenario: Unit-проверка читает project-aware task client boundary
- **WHEN** unit-слой проверяет client boundary project-aware task/opening flow
- **THEN** проверка читает явные `fetch` contract'ы для `open`, `start`, `iterate`, `check`, `save files`, `reset task` или `reset current level`
- **AND** подтверждает, что active project передаётся через client boundary без browser e2e или live credentials

#### Scenario: Unit-проверка читает runtime diagnostics task action
- **WHEN** unit-слой проверяет `start`, `iterate` или `check`
- **THEN** он читает structured diagnostics из action result
- **AND** проверка не требует внешнего telemetry backend или live credentials

#### Scenario: Unit-проверка читает runtime diagnostics preview payload
- **WHEN** unit-слой проверяет сборку Sandpack preview
- **THEN** он читает structured diagnostics из preview payload
- **AND** может отличить bounded cache hit/miss, budget degradation path и degraded compatibility path

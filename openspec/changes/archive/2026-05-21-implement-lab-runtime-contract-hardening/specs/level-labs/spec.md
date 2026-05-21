## MODIFIED Requirements

### Requirement: Лаборатория имеет стабильный runtime-контракт маршрутов

Система SHALL использовать единый canonical route map для рабочих маршрутов лаборатории и связанных task transition экранов.

#### Scenario: Пользователь открывает рабочую задачу лаборатории
- **WHEN** пользователь открывает рабочий маршрут задачи
- **THEN** canonical рабочим URL считается `/lab/<taskId>`
- **AND** route/page слой строит этот URL через общий runtime helper

#### Scenario: Пользователь открывает рабочий файл задачи
- **WHEN** пользователь открывает разрешённый рабочий экран задачи
- **THEN** canonical URL строится как `/lab/<taskId>/<screen>`
- **AND** экран проверяется по allowlist текущего уровня

#### Scenario: Legacy route ведёт к transition экрану
- **WHEN** пользователь открывает legacy lab route для check/done/next
- **THEN** система использует явный compatibility redirect к canonical task transition route
- **AND** redirect покрыт тестом маршрутизации или source-contract проверкой

### Requirement: Лаборатория строит пустое состояние задачи единым способом

Система SHALL использовать reusable factory для пустого `TaskData`, чтобы route/page/API слои не копировали shape вручную.

#### Scenario: Задача ещё не стартовала
- **WHEN** runtime должен вернуть данные ещё не начатой задачи
- **THEN** он строит `TaskData` через общий helper
- **AND** `contentByFileId`, `promptHistory`, `llmUsageSummary` и `labContext` имеют стабильный shape

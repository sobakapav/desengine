## MODIFIED Requirements

### Requirement: Мутации задачи выполняются через runtime boundary

Система SHALL выполнять локальные мутации состояния одной задачи через последовательную runtime boundary, чтобы параллельные действия пользователя не приводили к lost update или частично применённому состоянию.

#### Scenario: Два действия одновременно меняют одну задачу
- **WHEN** два lab action flow одновременно записывают файлы или progress одного `taskId`
- **THEN** система выполняет эти мутации последовательно
- **AND** итоговое состояние соответствует порядку завершения runtime boundary

#### Scenario: Два действия меняют разные задачи
- **WHEN** lab action flow меняют разные `taskId`
- **THEN** система не блокирует их общей глобальной очередью
- **AND** каждая задача сохраняет собственную последовательность мутаций

### Requirement: Route handlers используют переиспользуемые lab action services

Система SHALL держать core logic lab action flow в переиспользуемом runtime/service слое, а route handlers использовать как HTTP boundary.

#### Scenario: Пользователь запускает уровень через service boundary
- **WHEN** API route запускает текущий уровень задачи
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь уточняет задачу через service boundary
- **WHEN** API route выполняет уточняющий prompt по текущему уровню
- **THEN** route handler делегирует LLM-flow, запись файлов и prompt history runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь проверяет результат через service boundary
- **WHEN** API route проверяет результат текущего уровня
- **THEN** route handler делегирует LLM-check, progress mutation и check-result runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь сохраняет рабочие файлы
- **WHEN** API route сохраняет рабочие файлы задачи
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь сбрасывает задачу через service boundary
- **WHEN** API route сбрасывает задачу
- **THEN** повторно используемая runtime/service функция отвечает за основную доменную операцию
- **AND** route handler отвечает за access guard, request parsing и response mapping

#### Scenario: Route handlers используют переиспользуемые lab action services
- **WHEN** разработчик меняет route handlers ключевых lab actions
- **THEN** core logic остаётся в `lib/task/actions.ts`
- **AND** route handlers отвечают за access guard, params/body parsing и HTTP response mapping

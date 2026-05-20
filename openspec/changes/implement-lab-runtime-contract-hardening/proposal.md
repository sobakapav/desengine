## Why

Текущий `lab` уже стал главным пользовательским runtime системы: пользователь открывает задачу, стартует уровень, редактирует файлы, смотрит Sandpack preview, запускает уточнения, проверяет результат и сбрасывает задачу. Все ближайшие стратегические changes будут опираться именно на этот поток.

Перед тем как вводить `Project`, переключение UI kit на уровне проекта, workflow/workbench и будущие event/cost layers, нужно укрепить контракты lab runtime:

- убрать расхождение в canonical navigation между `/lab` и `/tasks`;
- вынести повторяющиеся shape пустого `TaskData`;
- отделить core flows от route handlers;
- добавить минимальную защиту локального user state от конфликтующих мутаций;
- добавить воспроизводимые проверки lab-flow без live credentials.

Это change про архитектурное укрепление без радикального изменения UX.

## What Changes

- Фиксируем canonical route map для lab/task entry points:
  - `/lab/:taskId` остаётся основным рабочим входом в лабораторию;
  - `/lab/:taskId/:screen` остаётся deep-link на рабочий файл;
  - check/done/legacy redirects явно документируются и покрываются тестами.
- Вводим единую фабрику empty task data, чтобы route/page/API слои не копировали shape вручную.
- Выносим flows `start`, `iterate`, `check`, `save files`, `reset` в application service слой или близкий к нему runtime boundary, сохраняя прежний HTTP contract.
- Вводим минимальный per-task mutation boundary для локального файлового user state.
- Добавляем service-level проверку с mock LLM/fixture service data для критичного lab-flow.
- Сохраняем текущий пользовательский сценарий и внешний вид, кроме небольших UX-страховок вокруг ошибок/лимитов, если они нужны для стабильности.

## Non-goals

- Не вводим полный `Project Workspace`.
- Не реализуем `project-ui-kit-switching`.
- Не подключаем новые UI kit'ы.
- Не меняем Node.js, сборщик, Turbopack, Sandpack как технологию или install-critical инфраструктуру.
- Не делаем Figma import, cloud/electron packaging, cost/experience/event log.
- Не переписываем lab UI полностью.

## Capabilities

### Modified Capabilities

- `level-labs`: лаборатория получает явный runtime contract для маршрутов, пустого состояния, core flows и устойчивого сохранения.
- `task`: task runtime получает более стабильную границу мутаций и повторно используемые service-функции.
- `iteration`: start/iterate/check сохраняют прежнее поведение, но становятся проверяемыми без полного browser/live-provider окружения.
- `testing-layer`: добавляется проверяемый service-level след для lab-flow на mock/fixture данных.

## Acceptance Criteria

- В коде есть один reusable способ построить empty `TaskData` с корректным `llmUsageSummary` и `labContext`.
- Canonical route map lab/task flow зафиксирован в runtime helper/tests; legacy redirects не расходятся с ним.
- Route handlers для ключевых lab actions используют общий service/runtime boundary и не дублируют core flow целиком.
- Локальные мутации user state для одного `taskId` проходят через минимальную последовательную boundary.
- Есть тестовый слой без live credentials, который проверяет важный lab-flow или его service-level эквивалент.
- `npm run test:unit` и `npm run test:traceability` проходят, за исключением внешних unrelated dirty changes, если они существуют.

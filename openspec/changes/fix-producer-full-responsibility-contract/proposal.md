## Why

Система сейчас зашивает слишком узкую трактовку `producer`: как будто он только держит стратегический roadmap и обязан передавать реальное управление в отдельный `dispatcher`. Из-за этого новые чаты начинают спорить с нормальной для проекта моделью, где `producer` несёт полную ответственность и за смысл линии, и за её активную диспетчеризацию, а формализованные требования и сценарии могут появляться уже как результат roadmap-проработки.

## What Changes

- Уточняется системный контракт `producer` в OpenSpec и agent-facing инструкциях.
- `producer` фиксируется как полный owner линии:
  - удерживает смысл, roadmap и процесс трансформации;
  - активно управляет downstream changes;
  - работает источником истины для подчинённых changes.
- Убирается системное предположение, что producer обязан передавать ownership в отдельный `dispatcher`.
- `dispatcher` становится отдельным tactical child соответствующего `focus`, а не producer:
  - он может помогать тактике и спорить с producer по delivery;
  - но не обязан существовать для каждой producer-линии;
  - и не снимает полную ответственность с producer.
- Допускается прямое `parent_change` от `implement/fix` к `producer`.
- Producer и dispatcher одной focus-линии работают в конструктивной конкуренции и не выражают связь через `parent_change`.
- Для producer отдельно фиксируется, что формализованные requirements/scenarios не обязательны на старте и могут рождаться из roadmap.

## Capabilities

### New Capabilities

Нет.

### Modified Capabilities

- `admin-tools`: OpenSpec-tooling и traceability признают producer полным owner линии и перестают требовать обязательного дробления ответственности через dispatcher.

## Impact

- Затрагиваются `openspec/specs/admin-tools/spec.md`, agent-facing инструкции, OpenSpec tooling и unit-тесты governance-слоя.
- Новые чаты и инструменты `os:*` получают согласованную модель producer ownership.
- Финальная topology dispatcher уточняется follow-up change `fix-dispatcher-focus-topology-contract`: dispatcher остаётся child `focus`, а producer-конкуренция выражается через roadmap и delivery pressure.
- Install-critical инфраструктура не меняется.

## Acceptance Criteria

- `producer` в системном контракте описан как полный owner линии, а не как узкий стратегический слой.
- `traceability` и `os:*` допускают прямой `parent_change` на producer для downstream changes там, где это соответствует ownership-модели.
- AGENTS-инструкции явно запрещают сомневаться в нормальности producer с полной ответственностью за несколько направлений сразу.
- Зафиксировано, что формализованные requirements/scenarios для producer не обязательны на старте.
- Явно снята двусмысленность между producer ownership и dispatcher topology через follow-up правило `dispatcher -> focus`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `admin-tools`
  - scenario: producer ведёт собственный roadmap и управляет линией как полный owner
  - scenario: implement/fix напрямую подчиняется producer
  - scenario: dispatcher подчиняется focus напрямую
- Уровень проверки: `static/contract` + `unit`.
- Команды запуска:
  - `npm run test:traceability`
  - `npm run test:unit`
- Mock/fixture-данные:
  - временные OpenSpec fixtures с `producer`, `dispatcher`, `implement`, `fix`.
- Live credentials: не требуются.

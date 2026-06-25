## Why

В active OpenSpec одновременно живут две несовместимые модели:

- часть metadata и живых dispatcher-линий уже держит `dispatcher` как child `focus`;
- часть правил, tooling и planning-текстов всё ещё описывает `dispatcher` как downstream child `producer`.

Из-за этого topology перестаёт быть надёжной: один и тот же dispatcher может читаться либо как независимый tactical owner focus-линии, либо как иерархический помощник producer. Для governance-слоя это уже не косметическая неточность, а реальный источник ошибочной диспетчеризации и ложных unit/traceability ожиданий.

## What Changes

- В системных правилах фиксируется, что `dispatcher` является дочерним change соответствующего `focus`.
- `producer` остаётся полным owner смысла и roadmap линии, но не выражает связь с dispatcher через `parent_change`.
- Producer и dispatcher одной focus-линии считаются находящимися в конструктивной конкуренции:
  - producer давит смыслом, roadmap и ожиданиями трансформации;
  - dispatcher давит тактическим backlog, sequencing и delivery-прагматикой;
  - расхождение между ними трактуется как полезный управленческий сигнал.
- Dispatcher может использовать roadmap producer-а той же focus-орбиты как контекст, не становясь child producer-а.
- OpenSpec tooling, traceability и unit tests синхронизируются под эту topology.

## Capabilities

### Modified Capabilities

- `admin-tools`: rule layer, validation и user-facing tooling закрепляют topology `focus -> dispatcher`, а producer-конкуренция выражается через roadmap и `producer_ref` только на implement/fix уровне.

## Impact

- Затрагиваются `AGENTS.md`, `openspec/specs/admin-tools/spec.md`, OpenSpec traceability/tooling и активные planning changes, где была зашита модель `dispatcher -> producer`.
- Прямой `parent_change` от `implement/fix` к `producer` остаётся допустимым.
- Install-critical инфраструктура не меняется.

## Acceptance Criteria

- Системные правила явно говорят, что dispatcher подчиняется `focus`, а не `producer`.
- Traceability запрещает `parent_change` dispatcher на producer и допускает producer roadmap в той же focus-орбите.
- User-facing tooling перестаёт объяснять dispatcher как child producer-а.
- Активные architecture/domain dispatcher changes больше не содержат явного требования иерархического parentage к producer.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `admin-tools`
  - scenario: producer работает рядом с dispatcher без иерархического подчинения
  - scenario: dispatcher подчиняется focus напрямую
  - scenario: dispatcher не может хранить producer-контекст
  - scenario: dispatcher ссылается на унаследованный roadmap
- Уровень проверки: `static/contract` + `unit`.
- Команды запуска:
  - `npm run test:traceability`
  - `npm run test:unit`
- Mock/fixture-данные:
  - временные OpenSpec fixtures с `focus`, `producer`, `dispatcher`, `implement`, `fix`.
- Live credentials: не требуются.

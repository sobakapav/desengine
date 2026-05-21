## Why

Чтобы событийная линия не осталась набором типов и service-boundary без общего проверочного следа, нужен отдельный test harness. Он должен закрепить reusable fixtures, traceability и правила проверки foundation-уровня ещё до того, как появятся реальные producers `experience`, `action` и `cost`.

Иначе каждая следующая реализация начнёт собирать свои тестовые данные и трактовать общий contract по-своему.

## What Changes

- Вводится общий test harness для `EventEnvelope` и runtime-boundary журнала:
  - обязательные foundation fixtures для валидного и невалидного `EventEnvelope`;
  - обязательные helper'ы для contract/unit проверок envelope-инвариантов;
  - обязательные fixture/helper'ы для service-level проверок runtime-boundary со `stub`/`no-op` sink без storage;
  - traceability-связи для foundation-сценариев `event-envelope`, `log-system-runtime-boundary` и `testing-layer`;
  - правила, когда нужна запись о deferred coverage в `test/traceability/coverage-plan.json`.
- Harness используется как единая тестовая база для последующих producer changes.
- Канонической поверхностью harness считается foundation-слой `@/lib/system/events` и unit/traceability-проверки вокруг него; локальные ad-hoc event shape не считаются допустимой базой даже для screen-level runtime-flow.

В первый заход не входят отдельные payload-fixtures для `experience`, `action` и `cost`: они остаются задачей downstream producer changes и должны опираться на этот foundation baseline, а не расширять его задним числом.

## Non-goals

- Не добавляем browser/e2e проверки пользовательских flows.
- Не тестируем реальный storage.
- Не подключаем live/provider credentials.
- Не подменяем собой downstream domain-specific test changes.

## Capabilities

### Modified Capabilities

- `testing-layer`: появляется общий test harness для foundation-линии product events.
- `event-envelope`: общий контракт получает reusable fixtures и traceability-след.
- `projects`: foundation-сценарии event log получают единый тестовый baseline.

## Acceptance Criteria

- Есть один reusable test harness для foundation event-линии.
- В нём явно перечислены обязательные артефакты первого захода:
  - builders/fixtures валидного `EventEnvelope`;
  - отрицательные fixtures для сломанного envelope;
  - stub/no-op log sink fixtures;
  - helper'ы для unit/contract/service assertions без реального storage.
- Traceability явно связывает foundation-сценарии с тестами и командами запуска.
- Producer-level fixtures/tests для `experience`, `action`, `cost` явно помечены как deferred и не считаются частью текущего MVP.
- Запись в `test/traceability/coverage-plan.json` требуется только если после внедрения harness хотя бы один заявленный foundation-сценарий остаётся без трассируемой проверки или обязательная проверка сознательно переносится на следующий change; в записи должны быть причина и этап закрытия.
- Следующие implement changes могут использовать этот harness, а не создавать свои базовые fixtures с нуля.

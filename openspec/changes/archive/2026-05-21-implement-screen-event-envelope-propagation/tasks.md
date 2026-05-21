## Tasks

- [x] 1. Зафиксировать один MVP-flow: `app/lab/[taskId]/[screen]/page.tsx` → `LabScreen` → `TaskScreenSection` → `Workbench`.
- [x] 2. Реализовать page-to-screen event contract для этого flow:
  - [x] 2.1 `page.tsx` собирает или нормализует event input
  - [x] 2.2 `LabScreen` получает единый текущий event
  - [x] 2.3 `TaskScreenSection` передаёт event и update-канал в workbench-контракт
- [x] 3. Реализовать один source of truth для screen event без дублирования локальных shape.
- [x] 4. Подключить минимум одного реального child consumer'а внутри `Workbench`, который наблюдает обновление события.
- [x] 5. Использовать один прозрачный runtime contract:
  - [x] 5.1 либо prop-driven contract
  - [x] 5.2 локальный screen-scoped provider не используется в MVP
  - [x] 5.3 второй параллельный путь запрещён
- [x] 6. Сделать смену `activeScreen` наблюдаемым update path для MVP event contract.
- [x] 7. Добавить проверку наблюдаемого поведения:
  - [x] 7.1 component/browser или integration/service тест на обновление события при смене `activeScreen`
  - [x] 7.2 traceability для runtime-сценария propagation в lab task screen
- [x] 8. Явно отложить `check`, `done`, `transition` и другие screen-state ветки за пределы MVP.
- [x] 9. Передать документационный follow-up в `implement-event-envelope-docs`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `event-envelope`: общий контракт используется в наблюдаемом `lab task screen` runtime-flow.
- `level-labs`: потомки `Workbench` получают обновлённый event по одному общему контракту в task/workbench flow.
- `testing-layer`: propagation проверяется как наблюдаемое поведение, а не только как foundation-тип.

Уровни проверки:
- static/contract: обязательный.
- unit: желателен для локальных helper'ов.
- component/browser: обязательный, если propagation проверяется через реальный UI contract.
- integration/service: допустим вместо browser только если сценарий остаётся наблюдаемым на screen runtime boundary.
- e2e smoke: не требуется для первого захода.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit`
- `npm run test:traceability`
- при browser/component-слое: релевантная команда из общего тестового контура

Mock/fixture-данные и credentials:
- fixture lab task screen event;
- fixture workbench child consumer;
- live credentials не нужны.

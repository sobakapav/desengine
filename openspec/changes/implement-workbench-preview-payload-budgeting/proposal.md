## Why

Сейчас пользовательская скорость в рабочем экране заметно зависит от того, как часто и насколько тяжело собирается preview payload. В текущем коде этот путь уже содержит несколько resource-sensitive шагов:

- route preview заново читает пользовательские файлы задачи;
- для `shadcn`-режима рекурсивно читается дерево `components/ui`;
- runtime dependency graph собирается обходом `node_modules`;
- Tailwind CSS компилируется как часть preview builder;
- часть кэшей есть, но они не образуют явного budget-контракта для CPU/RAM и не отделяют «полезный cache hit» от роста нагрузки.

Для `npm run start` это уже не локальная micro-оптимизация, а прямой user-facing путь: preview должен собираться быстрее и не должен бесконтрольно раздувать нагрузку на машину пользователя.

## What Changes

- Вводится implement-change `implement-workbench-preview-payload-budgeting` под `dispatcher-workbench`.
- Change должен ускорить user-facing preview pipeline:
  - уменьшить повторное чтение одинаковых runtime-источников;
  - сократить лишние rebuild'ы preview payload;
  - закрепить более дешёвый путь для повторных запросов с теми же входами.
- Change должен ввести явные guardrail'ы для preview resource path:
  - ограничить рост in-memory cache;
  - зафиксировать budget на тяжёлые derived artifacts preview;
  - определить, когда preview должен деградировать в безопасный fallback вместо продолжения дорогостоящей сборки.
- Изменения проходят через `dispatcher-workbench`, потому что речь идёт о runtime-поведении Workbench и его preview/tooling loop, а не о стратегической перестройке runtime-архитектуры целиком.

## Non-goals

- Не менять install-critical стек, Sandpack как технологию, Next.js или Turbopack.
- Не переписывать весь Workbench или весь preview runtime с нуля.
- Не вводить provider-level или task-action queue guardrail'ы: это отдельная runtime-линия.

## Capabilities

### Modified Capabilities

- `workbench`: preview-путь Workbench должен быстрее реагировать на повторные запросы и явнее ограничивать resource-heavy сборку.
- `level-labs`: лаборатория должна сохранять рабочий preview UX, даже если часть preview pipeline уходит в bounded degradation.

## Acceptance Criteria

- Preview route и builder имеют явно зафиксированный budget для cache/derived artifacts вместо неограниченного роста памяти.
- Повторные preview-сборки с теми же входами избегают лишнего чтения runtime-источников там, где это допустимо по контракту.
- Для перегруженного или несовместимого preview pipeline определён безопасный degradation path вместо бесконтрольного расхода ресурсов.
- В tasks зафиксирована тестовая стратегия для unit и component/browser слоя.

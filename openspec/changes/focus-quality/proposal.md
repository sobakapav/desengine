## Why

Проекту нужен отдельный стратегический фокус на качестве и проверяемости системы, чтобы тестовый контур, traceability и общие quality-правила не растворялись внутри общего `focus-tech`.

Сейчас качество живёт как важная, но вторичная часть технического контура. Для следующих волн изменений этого уже недостаточно: тестовая подсистема, правила проверки и требования к качеству должны иметь собственный верхнеуровневый фокус.

## What Changes

- Вводится focus-change `focus-quality` как постоянный стратегический контур качества и проверяемости.
- Под `focus-quality` переводятся changes, которые управляют тестовой подсистемой:
  - `dispatcher-test-system`.
- Внутри контура `focus-quality` сохраняется baseline-исследование текущего состояния тестового слоя, выполненное отдельным change `producer-test-system-current-state`.
- Под `focus-quality` добавляется UX-контур качества взаимодействия:
  - `dispatcher-ux`.
- `focus-quality` становится родительским контуром для будущих dispatcher/producer/implement changes, связанных с:
  - тестовой подсистемой;
  - traceability;
  - quality gates;
  - качеством пользовательского опыта;
  - правилами mock/fixture/live-проверок.

## Non-goals

- Не добавляет runtime-фичи и не меняет пользовательское поведение.
- Не заменяет конкретные test/quality dispatcher или implement changes.
- Не меняет install-critical инфраструктуру без отдельного change.

## Acceptance Criteria

- `focus-quality` отображается в `npm run os` как верхнеуровневый фокус.
- `dispatcher-test-system` отображается как дочерний change у `focus-quality`.
- baseline по текущему состоянию тестового слоя остаётся доступным как historical input для quality-линии.
- `dispatcher-ux` отображается как дочерний change у `focus-quality`.
- `focus-tech` больше не выступает родителем для тестовой подсистемы.

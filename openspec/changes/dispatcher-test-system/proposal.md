## Why

Подсистема тестирования уже существует как набор команд, сценариев и локальных правил, но ей не хватает отдельного управляющего контура. Без такого dispatcher'а тестовый слой легко распадается на несвязанные инициативы: unit, traceability, e2e, live-проверки и инфраструктурные проверки эволюционируют независимо и теряют единые критерии готовности.

## What Changes

- Вводится `dispatcher-test-system` как отдельный стратегический диспетчер подсистемы тестирования.
- Dispatcher определяет границы тестового слоя:
  - тестовые capability и сценарии OpenSpec;
  - команды запуска и обязательные уровни проверки;
  - правила работы с mock/fixture-данными;
  - правила фиксации live/provider credentials и условий их использования;
  - roadmap для producer/implement changes, связанных с тестированием.
- Dispatcher не меняет runtime системы напрямую, а управляет согласованностью изменений в тестовом контуре через конкретные downstream `implement`/`fix` changes.
- Dispatcher может порождать такие исполнительские changes и обязан контролировать, что именно они вносят runtime- и tooling-изменения в тестовый слой.

## Non-goals

- Не добавляет новые runtime-фичи продукта.
- Не заменяет конкретные implement changes, которые будут менять тестовые команды, harness или инфраструктуру.
- Не меняет install-critical стек без отдельного change и явного разрешения.

## Capabilities

### Modified Capabilities

- `testing-layer`: управление тестовой подсистемой проходит через отдельный dispatcher, который координирует и контролирует downstream `implement`/`fix` changes по тестовому контуру.

## Acceptance Criteria

- `dispatcher-test-system` отображается в дереве OpenSpec как дочерний change у `focus-quality`.
- Dispatcher фиксирует область ответственности тестовой подсистемы и классы будущих дочерних changes.
- Dispatcher задаёт правило: изменения тестового runtime/tooling делаются не внутри самого dispatcher, а через контролируемые им downstream `implement`/`fix` changes.
- Dispatcher требует для downstream behavior-change changes явную тестовую часть: уровни проверки, команды запуска, mock/fixture-данные и правила для live credentials.

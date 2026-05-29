## Context

В проекте уже есть несколько слоёв проверки: `test:unit`, `test:traceability`, `test:e2e`, `test:full`, отдельные quality-команды и OpenSpec-требования к тестовой части changes. При этом общая картина управления тестовой подсистемой распределена по разным change'ам и документам.

Нужен отдельный dispatcher, который удерживает тестовый слой как систему: определяет его карту, приоритеты, допуски и порядок последующих изменений.

## Decisions

1. `dispatcher-test-system` становится точкой координации для всех change'ов, которые:
   - меняют общий тестовый слой;
   - добавляют новые обязательные уровни проверки;
   - перестраивают команды тестового запуска;
   - вводят общие mock/fixture-подходы;
   - описывают live/provider-проверки и их guardrails.
   - меняют test runtime/tooling через отдельные downstream `implement`/`fix` changes под контролем dispatcher.

2. Dispatcher не выполняет реализацию сам:
   - анализ текущего состояния выносится в `producer-test-system-current-state`;
   - runtime и tooling-изменения выполняются отдельными implement/fix changes;
   - dispatcher создаёт, направляет и контролирует эти исполнительские changes как часть собственной зоны ответственности.

3. В каждый downstream behavior-change по тестовой линии обязательно включается человеко-понятная тестовая часть:
   - затронутые capability/scenarios;
   - уровень проверки;
   - команда запуска;
   - mock/fixture-данные;
   - live credentials, если нужны;
   - причина и план закрытия, если покрытие откладывается.

4. Для foundation event-линии тестовый dispatcher координирует отдельный implement-step:
   - `implement-event-envelope-test-harness`.

5. Контракт `testing-layer` должен прямо отражать эту модель управления:
   - сам dispatcher остаётся no-code change;
   - код и tooling меняются через дочерние `implement`/`fix` changes;
   - downstream changes не считаются самостоятельной тестовой стратегией вне контекста `dispatcher-test-system`.

## Risks / Trade-offs

- [Риск] Dispatcher останется декларативным и не повлияет на практику.
  → Mitigation: привязывать к нему конкретные producer/implement changes тестовой подсистемы.

- [Риск] Тестовый слой будет расти бессистемно из-за смешения локальных и live-проверок.
  → Mitigation: держать единые guardrails и отдельную классификацию уровней проверки.

- [Риск] Изменения команд запуска начнут расходиться с OpenSpec traceability.
  → Mitigation: считать `test:traceability` обязательным базовым контуром для тестовых изменений.

## Open Questions

- Нужен ли отдельный roadmap-документ для тестовой подсистемы или достаточно dispatcher + child changes.
- Где проходит граница между общей тестовой подсистемой и domain-specific quality gates вроде `code-quality-text`.

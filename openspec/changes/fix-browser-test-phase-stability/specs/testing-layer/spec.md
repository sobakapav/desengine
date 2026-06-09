## MODIFIED Requirements

### Requirement: Обязательные тесты воспроизводимы без внешних секретов

#### Scenario: Browser verification возвращает phase-level verdict

- **WHEN** разработчик запускает обязательную browser/e2e verification-команду
- **THEN** система явно различает фазы `target-ready`, `browser-ready`, `fixture-ready`, `product-run` и `cleanup`
- **AND** failure классифицируется по фазе, а не как общий непрозрачный browser-crash
- **AND** product regression не объявляется, если browser verification не прошла обязательные системные фазы

#### Scenario: Cleanup failure не скрывает итог product-run

- **WHEN** product-specific browser scenario уже завершил основной verdict
- **AND** последующий teardown или cleanup падает
- **THEN** система помечает это как отдельную post-run instability
- **AND** не стирает сведения о том, что произошло в фазе `product-run`

## MODIFIED Requirements

### Requirement: Проверка change включена в единый слой тестирования

Система SHALL удерживать auth/system diagnostics orchestration unit-проверкой, чтобы независимые network probes не возвращались к последовательному выполнению на критическом route path.

#### Scenario: Авторизация не ждёт sequential network probes диагностики

- **WHEN** система собирает `getResourceStates()` для `/auth` или `/system`
- **AND** LLM и allowlist resource probes независимы друг от друга
- **THEN** система запускает их параллельно
- **AND** не ждёт завершения первого probe перед стартом второго

#### Scenario: Параллельные probes не переставляют порядок resource cards

- **WHEN** система собирает `getResourceStates()` через параллельные diagnostics probes
- **THEN** итоговый порядок resource cards остаётся стабильным и не зависит от того, какой probe завершился раньше

## Tasks

- [ ] 1. Зафиксировать bounded contract для task action runtime.
- [ ] 2. Ввести guardrail'ы на очередь и давление нагрузки:
  - [ ] 2.1 ограничить длину per-task mutation queue;
  - [ ] 2.2 ограничить число одновременно удерживаемых pending action contexts;
  - [ ] 2.3 не допускать бесконтрольного роста ожидания на машине пользователя.
- [ ] 3. Провести overload-path до user-facing actions:
  - [ ] 3.1 `start`, `iterate`, `check` получают retriable overload-отказ;
  - [ ] 3.2 `save files` и `reset` не создают частично поставленные в очередь мутации;
  - [ ] 3.3 runtime-состояние остаётся консистентным.
- [ ] 4. Добавить или обновить тесты и traceability.
- [ ] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `task`, `iteration`, `level-labs`.
- [x] Выбрать уровень проверки: unit + static/contract.
- [ ] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:unit -- test/unit/task-mutation-boundary.test.ts`.
- [x] Зафиксировать test data contract: unit/static проверки должны использовать локальные mocks/stubs mutation runtime и не требовать live credentials, браузера или provider-вызовов.
- [x] Зафиксировать правило для coverage-plan: если multi-task pressure или overload-refusal сценарий не будет покрыт в этой волне, добавить запись в `test/traceability/coverage-plan.json` с указанием конкретного пробела и плана закрытия.

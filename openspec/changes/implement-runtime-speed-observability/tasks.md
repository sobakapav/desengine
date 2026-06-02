## Tasks

- [ ] 1. Зафиксировать structured diagnostics contract для speed/load paths.
- [ ] 2. Добавить observability на key runtime участки:
  - [ ] 2.1 preview payload build;
  - [ ] 2.2 `start`;
  - [ ] 2.3 `iterate`;
  - [ ] 2.4 `check`;
  - [ ] 2.5 backlog / overload / degradation paths.
- [ ] 3. Убедиться, что diagnostics пригодны для downstream test harness и budget verdicts.
- [ ] 4. Добавить или обновить тесты и traceability.
- [ ] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `task`, `level-labs`, `testing-layer`.
- [x] Выбрать уровень проверки: unit + static/contract.
- [ ] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:unit -- test/unit/task-actions-boundary.test.ts test/unit/sandpack-preview.test.ts`.
- [x] Зафиксировать test data contract: diagnostics должны проверяться на локальных unit/stub сценариях без live credentials, без внешней telemetry-инфраструктуры и без provider-вызовов.
- [x] Зафиксировать правило для coverage-plan: если какой-то diagnostics signal для overload/degradation path останется непроверенным, добавить запись в `test/traceability/coverage-plan.json` с названием пропущенной ветки и планом закрытия.

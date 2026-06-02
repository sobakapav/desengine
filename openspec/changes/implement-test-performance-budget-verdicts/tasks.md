## Tasks

- [ ] 1. Зафиксировать reusable contract performance verdicts.
- [ ] 2. Добавить budget assertions для key paths `npm run start`:
  - [ ] 2.1 preview payload build;
  - [ ] 2.2 `start`;
  - [ ] 2.3 `iterate`;
  - [ ] 2.4 `check`;
  - [ ] 2.5 lab/task entry path.
- [ ] 3. Обеспечить fixture-controlled измерение без live/provider зависимостей.
- [ ] 4. Добавить или обновить тесты и traceability.
- [ ] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `testing-layer`.
- [x] Выбрать уровень проверки: unit + static/contract.
- [ ] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:unit -- test/unit/performance-budget-verdicts.test.ts`.
- [x] Зафиксировать test data contract: performance verdicts измеряются только в controlled fixture/stub режиме, без live credentials, внешних провайдеров и machine-specific ручных прогонов.
- [x] Зафиксировать правило для coverage-plan: если какой-то key path `npm run start` не попадёт в первую волну verdicts, добавить запись в `test/traceability/coverage-plan.json` с указанием конкретного сценария и причины отсрочки.

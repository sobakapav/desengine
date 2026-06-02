## Tasks

- [ ] 1. Зафиксировать reusable harness contract для speed/load линии.
- [ ] 2. Добавить базовые сценарии harness:
  - [ ] 2.1 cold/warm path;
  - [ ] 2.2 repeated preview rebuild;
  - [ ] 2.3 repeated `iterate` / `check`;
  - [ ] 2.4 overload backlog path;
  - [ ] 2.5 oversized payload/output refusal.
- [ ] 3. Обеспечить fixture/stub runtime без live credentials.
- [ ] 4. Добавить или обновить integration-тесты и traceability.
- [ ] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `testing-layer`.
- [x] Выбрать уровень проверки: integration + static/contract.
- [ ] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:integration`.
- [x] Зафиксировать test data contract: harness должен работать на fixtures/stubs и synthetic scenarios без live credentials, браузерной ручной интеракции и provider-зависимостей.
- [x] Зафиксировать правило для coverage-plan: если какой-то сценарий cold/warm, repeated actions, overload или oversize останется вне первой версии harness, добавить запись в `test/traceability/coverage-plan.json` с точным названием пробела.

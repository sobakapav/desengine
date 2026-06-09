## Tasks

- [x] 1. Зафиксировать reusable harness contract для speed/load линии.
- [x] 2. Добавить базовые сценарии harness:
  - [x] 2.1 cold/warm path;
  - [x] 2.2 repeated preview rebuild;
  - [x] 2.3 repeated `iterate` / `check`;
  - [x] 2.4 overload backlog path;
  - [x] 2.5 oversized payload/output refusal.
- [x] 3. Обеспечить fixture/stub runtime без live credentials.
- [x] 4. Добавить или обновить integration-тесты и traceability.
- [x] 5. Выполнить внешнюю проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `testing-layer`.
- [x] Выбрать уровень проверки: integration + static/contract.
- [x] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команды проверки: `npm run test:integration` и `npm run test:traceability`.
- [x] Зафиксировать test data contract: harness должен работать на fixtures/stubs и synthetic scenarios без live credentials, браузерной ручной интеракции и provider-зависимостей.
- [x] Зафиксировать правило для coverage-plan: если какой-то сценарий cold/warm, repeated actions, overload или oversize останется вне первой версии harness, добавить запись в `test/traceability/coverage-plan.json` с точным названием пробела.

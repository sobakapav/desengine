## Tasks

- [ ] 1. Зафиксировать bounded contract для LLM input/output path.
- [ ] 2. Ввести budget-проверки до дорогих побочных эффектов:
  - [ ] 2.1 ограничить размер instruction и связанного runtime context;
  - [ ] 2.2 ограничить input images и structured-output path;
  - [ ] 2.3 ограничить итоговый write-set до записи пользовательских файлов.
- [ ] 3. Провести budget-error через user-facing runtime:
  - [ ] 3.1 oversized path завершается явной bounded ошибкой;
  - [ ] 3.2 oversized output не приводит к частичной записи файлов;
  - [ ] 3.3 runtime отличает budget-error от timeout/network/provider ошибок.
- [ ] 4. Добавить или обновить тесты и traceability.
- [ ] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `llm`, `task`, `iteration`.
- [x] Выбрать уровень проверки: unit + static/contract.
- [ ] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:unit -- test/unit/task-start-llm.test.ts test/unit/task-actions-boundary.test.ts`.
- [x] Зафиксировать test data contract: oversized input/output path должен проверяться на локальных stubbed LLM-ответах и synthetic payloads без live credentials и без реального provider-call.
- [x] Зафиксировать правило для coverage-plan: если какой-то budget-path останется только на static/contract уровне, добавить запись в `test/traceability/coverage-plan.json` с перечислением непокрытых instruction/output/write-set веток.

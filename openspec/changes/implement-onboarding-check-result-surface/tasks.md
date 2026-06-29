## Tasks

- [ ] 1. Уточнить пользовательский контракт onboarding check/result surfaces для новой цепочки.
- [ ] 2. Внести кодовые изменения в check/recheck/result surfaces, чтобы они читались через workflow-шаг и checklist.
- [ ] 3. Подготовить change к внешней проверке по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить или обновить тесты.

Затронутые OpenSpec capability/scenarios:
- `task`: check-result объясняет исход шага работы, а не только status уровня.
- `workflow`: результат проверки привязан к текущему workflow-шагу.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется для первой волны.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <targeted-onboarding-check-result-tests>`

Mock/fixture-данные и credentials:
- Нужны unit fixtures для passed/needs-rework/retry surface states.
- Live credentials не требуются.

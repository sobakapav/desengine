## Tasks

- [ ] 1. Уточнить минимальный user-facing набор metadata для нового onboarding-режима.
- [ ] 2. Внести кодовые изменения, чтобы onboarding surfaces показывали только нужный project/workflow/check/result контекст.
- [ ] 3. Подготовить change к внешней проверке по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить или обновить тесты.

Затронутые OpenSpec capability/scenarios:
- `task`: user-facing metadata не перегружает пользователя внутренним task/level шумом.
- `projects`: project context остаётся видимым как главный внешний контекст.
- `workflow`: workflow-step context показывается как основная текущая работа.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется для первой волны.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <targeted-onboarding-metadata-surface-tests>`

Mock/fixture-данные и credentials:
- Нужны unit fixtures для surface summaries и metadata visibility rules.
- Live credentials не требуются.

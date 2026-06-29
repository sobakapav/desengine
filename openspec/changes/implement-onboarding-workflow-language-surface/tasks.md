## Tasks

- [ ] 1. Уточнить, какие onboarding surfaces должны перейти на workflow-язык в первой UI-волне.
- [ ] 2. Внести кодовые изменения в task/lab/progress surfaces, чтобы основной язык стал workflow-step oriented.
- [ ] 3. Подготовить change к внешней проверке по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить или обновить тесты.

Затронутые OpenSpec capability/scenarios:
- `workflow`: onboarding surface показывает текущий workflow-шаг вместо level как основного языка.
- `task`: task progress и task screen читаются через шаг работы и цель.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется для первой волны.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <targeted-onboarding-workflow-language-tests>`

Mock/fixture-данные и credentials:
- Нужны unit fixtures для progress labels, task screen text и workflow-step presentation.
- Live credentials не требуются.

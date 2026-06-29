## Tasks

- [ ] 1. Уточнить границы project-aware entry surface для onboarding.
- [ ] 2. Внести кодовые изменения в onboarding entry/task-list surfaces, чтобы вход в задачу читался через проектный контекст.
- [ ] 3. Подготовить change к внешней проверке по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить или обновить тесты.

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь видит проект как точку входа в работу.
- `task`: onboarding task entry перестаёт читаться как project-less каталог уровней.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется для первой волны.
- integration: не требуется для первой волны.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <targeted-onboarding-entry-tests>`

Mock/fixture-данные и credentials:
- Нужны локальные unit fixtures для project-aware task entry state и surface labels.
- Live credentials не требуются.

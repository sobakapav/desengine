## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения в project/task surfaces, чтобы путь `проект -> компонент -> работа` читался проще.
- [x] 2.1. Добавить на страницу проекта более явный пользовательский маршрут.
- [x] 2.2. Упростить статусы и подсказки в карточках компонентов.
- [x] 2.3. Уточнить контекст на экране задачи.
- [x] 2.4. Дочистить соседние user-facing поверхности цепочки: список задач и заголовок рабочей сессии.
- [ ] 3. Подготовить change к внешней проверке по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь читает проект как точку входа в работу.
- `workflow`: пользователь понимает, как открыть и продолжить работу над компонентом.
- `task`: экран задачи удерживает связь с проектом и компонентом.

Уровни проверки:
- unit: обязательный.
- static/contract: обязательный.
- integration: не требуется для этой UX-волны.
- component/browser: не требуется для этой UX-волны.
- e2e smoke: не требуется для этой UX-волны.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- project-component-registry-surface workflow-component-aware-surface-labels project-task-assignment-surface`

Mock/fixture-данные и credentials:
- Нужны только unit fixtures для project/component/workflow surface models.
- Live credentials не требуются.

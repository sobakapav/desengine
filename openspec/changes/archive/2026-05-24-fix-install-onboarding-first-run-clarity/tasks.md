## Tasks

- [x] 1. Уточнить постановку и границы реализации по `dispatcher-doc`, `external-local-onboarding` и `onboarding-repo`
- [x] 2. Внести документационные и конфигурационные изменения для первого install-flow
- [ ] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Затронутые capability/scenarios: `external-local-onboarding` / "Пользователь проходит новую установку по шаблонной конфигурации", "Команда перепроверяет документацию локального запуска", "Читатель открывает инструкцию первого запуска"
- [x] Уровень проверки: `static/contract`
- [x] Добавить или обновить тесты: новые runtime-тесты не нужны, change ограничен канонической документацией и шаблоном конфига
- [x] Зафиксировать команду проверки: `npm run test:traceability`
- [x] Mock/fixture-данные и live credentials: не нужны

## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [ ] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `projects`
  - `Страница проекта является главной рабочей поверхностью`
  - `Проект является контейнером для пользовательских компонентов`
  - `Проект показывает свою историю и диагностику`
  - `Проект показывает workflow как наблюдаемый слой`
- `workflow`
  - `Project-aware workflow доступен для пользовательского readout`
- `navigation`
  - `Legacy task и lab index routes перенаправляют в проекты`

Уровень проверки:
- `static/contract`
- `unit`

Команда проверки:
- `npm run test:unit`

Mock/fixture-данные и live credentials:
- Используются unit-level локальные fixture snapshot'ы для project workflow и project history.
- Live credentials не требуются.

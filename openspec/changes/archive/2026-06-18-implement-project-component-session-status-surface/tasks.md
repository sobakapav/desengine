## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `projects`: "Пользователь начинает работу над компонентом проекта"
- `projects`: "Компонент проекта сохраняет связь с backing task"
- `projects`: "Пользователь видит состояние workflow-сессии прямо в карточке компонента проекта"
- `workflow`: "Пользователь продолжает workflow компонента из страницы проекта"

Уровень проверки:
- unit

Команда проверки:
- `npx vitest run --project unit test/unit/project-component-registry-surface.test.ts test/unit/project-workflow-readout-surface.test.ts test/unit/project-config-and-ui-kit-contract.test.ts`

Mock/fixture-данные и live credentials:
- Достаточно unit-level фикстур для `ProjectComponent`, `ProjectWorkflowReadoutSnapshot` и task catalog.
- Live credentials не требуются.

Результат внешней проверки:
- Внешний verification-agent прогнал указанную unit-команду после реализации и после финальной точечной правки в `ProjectComponentsPanel.tsx`.
- Итог последнего прогона: зелёный статус без дополнительных изменений со стороны verification-agent.

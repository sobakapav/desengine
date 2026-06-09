## Tasks

- [ ] 1. Зафиксировать source of truth для названия задачи и обновить OpenSpec-контракт, если меняется наблюдаемое поведение task/task-hints контура.
- [ ] 2. Добавить `title` в task schema, runtime types и server-runtime чтение task catalog.
- [ ] 3. Показать название задачи в пользовательских task-поверхностях, где сейчас выводится только `taskId` или безымянная задача.
- [ ] 4. Добавить или обновить тесты и traceability для нового task title contract.
- [ ] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task`: сценарии списка задач, открытия задачи и user-facing представления самой задачи.
- `level-labs`: сценарии рабочего экрана, если название выводится внутри lab/workbench UI.
- `prompt-context`: только если task title попадёт в шаблонный context для task hints.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для schema/runtime-модели и task catalog readers.
- component/browser: обязателен, если title появляется в пользовательском UI.
- integration: не требуется по умолчанию.
- e2e smoke: по необходимости, если title затрагивает целостный flow переходов между task/list/lab.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- browser/e2e-команда должна быть уточнена в ходе реализации, если change меняет пользовательский экран

Mock/fixture-данные и credentials:
- fixture-данные должны включать хотя бы одну задачу с явным `title` в `onboarding/tasks/*/config.json` и ожидаемое отображение в task UI;
- live credentials не нужны.

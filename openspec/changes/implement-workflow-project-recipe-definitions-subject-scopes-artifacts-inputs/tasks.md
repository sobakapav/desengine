## Tasks

- [x] 1. Зафиксировать продуктовый каталог workflow-примеров и их классификацию.
- [x] 2. Добавить в OpenSpec новую архитектурную модель workflow:
  - [x] 2.1 `WorkflowDefinition` как reusable шаблон операции;
  - [x] 2.2 `WorkflowRun` как project-scoped запуск;
  - [x] 2.3 `WorkflowSubject` для component/screen/data/domain/system scopes;
  - [x] 2.4 `Workflow input/output contracts` и artifact slots;
  - [x] 2.5 `entry surfaces` и `follow-up workflows`.
- [x] 3. Обновить capability-слой под новую роль workflow:
  - [x] 3.1 `workflow`;
  - [x] 3.2 `projects`;
  - [x] 3.3 `artifacts`;
  - [x] 3.4 `prompt-context`;
  - [x] 3.5 новый capability `workflow-catalog`.
- [x] 4. Обновить `docs/next-steps.md`, чтобы следующий слой явно смотрел на каталог workflow, а не только на readout.
- [ ] 5. Подготовить следующую foundation-волну реализации:
  - [x] 5.1 выбрать первый набор `WorkflowDefinition`;
  - [ ] 5.2 определить, какие текущие runtime-структуры нужно заменить;
  - [ ] 5.3 определить минимальный migration path от текущего `project-design-workflow`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `workflow`: workflow становится каталогом операций, а не только одним recipe;
  - `workflow-catalog`: система публикует reusable catalog definitions;
  - `projects`: проект умеет запускать workflow из разных subject surfaces;
  - `artifacts`: workflow объявляет input/output contracts через artifact slots;
  - `prompt-context`: PromptContext учитывает definition, subject и artifact bindings.
- Уровни проверки:
  - static/contract: обязательный;
  - unit: не обязателен в этой волне, если меняется только spec/documentation слой.
- Команды запуска:
  - `npm run test:traceability`
- Mock/fixture-данные и credentials:
  - не требуются, если change пока фиксирует только архитектуру и продуктовые контракты.

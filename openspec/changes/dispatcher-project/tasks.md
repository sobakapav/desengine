## Tasks

- [ ] 1. Зафиксировать `dispatcher-project` как tactical owner первой project-wave под `focus-domain`.
- [ ] 2. Привязать dispatcher к `producer-project` и явно сверить его с `producer-architecture-transform`.
- [ ] 3. Зафиксировать tactical ownership для:
  - [ ] 3.1 canonical `ProjectWorkspace`;
  - [ ] 3.2 project registry и active project context;
  - [ ] 3.3 onboarding/task layer внутри project context;
  - [ ] 3.4 отдельного workflow layer как процесса решения;
  - [ ] 3.5 отдельного `workbench` / preview binding;
  - [ ] 3.6 тяжёлой migration-операции при смене project `UI kit`.
- [ ] 4. Подготовить dispatcher к маршрутизации downstream `implement-*` / `fix-*` changes первой волны.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: project line получает отдельного tactical owner.
- `task`: downstream task-layer changes должны жить внутри project contract.
- `workflow`: downstream workflow semantics changes должны жить внутри project contract как отдельный процесс решения.
- `workbench`: downstream workbench changes должны жить внутри project contract и не подменять workflow.
- `testing-layer`: все child behavior-change ветки обязаны иметь понятную verification-часть.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: dispatcher задаёт ownership и delivery-рамку, а не runtime behavior.

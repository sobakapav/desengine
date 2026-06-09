## Tasks

- [ ] 1. Зафиксировать пользовательские сценарии проектного режима работы.
- [ ] 2. Описать минимальную модель `Project Workspace` и project-scoped данных.
- [ ] 3. Описать связь `Project` ↔ `Task` ↔ `Workflow`.
- [ ] 4. Описать границу MVP project mode без обязательного roadmap-слоя.
- [ ] 5. Описать roadmap проекта как следующую волну и варианты связи roadmap ↔ задачи ↔ прогресс.
- [ ] 6. Подготовить план декомпозиции в будущие downstream changes.
- [ ] 7. Подготовить тестовую стратегию и traceability-план для будущих behavior-change changes.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `projects`
  - capability: `task`
  - capability: `workflow`
  - scenario: idea-change фиксирует MVP-first рамку для project mode и откладывает roadmap на следующую волну.
- Уровень проверки: `static / traceability`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.

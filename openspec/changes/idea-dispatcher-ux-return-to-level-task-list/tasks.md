## Tasks

- [ ] 1. Зафиксировать UX-гипотезу возврата к списку задач уровня после успеха.
- [ ] 2. Описать затронутые capability и конфликты с текущим progression-contract.
- [ ] 3. Подготовить downstream change, который проверит:
  - [ ] 3.1 нужен ли возврат всегда или только в части сценариев;
  - [ ] 3.2 как это влияет на `task-levels` и `user-progress`;
  - [ ] 3.3 как проверять UX-эффект после реализации.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task-levels`: потенциальная смена маршрута после успешного завершения задачи.
- `user-progress`: потенциальная смена точки возврата и представления прогресса.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, idea не меняет runtime.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются.

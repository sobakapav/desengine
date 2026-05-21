## Tasks

- [ ] 1. Найти подходящее место в кодовой базе для общего контракта `EventEnvelope`.
- [ ] 2. Реализовать общий shape `EventEnvelope` и связанные enum/utility:
  - [ ] 2.1 обязательные поля `eventId`, `kind`, `occurredAt`, `scope`, `privacyClass`, `redactionState`, `payload`
  - [ ] 2.2 scope fields `projectId`, `taskId`, `workflowStepId`, `workbenchInstanceId`
  - [ ] 2.3 `privacyClass`
  - [ ] 2.4 `redactionState`
  - [ ] 2.5 `kind` / payload carrier
- [ ] 3. Добавить слой валидации или source-contract helper для envelope-инвариантов.
  - [ ] 3.1 разрешить только scope-комбинации `project`, `task`, `workflow-step`, `workbench-instance`
  - [ ] 3.2 запретить неполные и смешанные scope-комбинации
  - [ ] 3.3 отклонять envelope без любого обязательного поля
- [ ] 4. Добавить fixture/builders для минимум трёх семейств:
  - [ ] 4.1 `experience`
  - [ ] 4.2 `action`
  - [ ] 4.3 `cost`
- [ ] 5. Добавить unit/contract tests на:
  - [ ] 5.1 валидные scope-комбинации `project`, `task`, `workflow-step`, `workbench-instance`
  - [ ] 5.2 невалидные сочетания scope-полей
  - [ ] 5.3 отсутствие обязательных полей envelope
  - [ ] 5.4 допустимые и недопустимые значения `privacyClass` и `redactionState`
- [ ] 6. Обновить traceability для `event-envelope` и связанных сценариев foundation-уровня.
- [ ] 7. Зафиксировать критерий завершения первого implement-step:
  - [ ] 7.1 foundation-контракт готов к переиспользованию downstream changes
  - [ ] 7.2 реальные producers, storage и runtime wiring остаются вне этого шага
- [ ] 8. Подготовить команды внешней проверки change:
  - [ ] 8.1 `npm run test:unit`
  - [ ] 8.2 `npm run test:traceability`
  - [ ] 8.3 при переносе покрытия оформить запись в `test/traceability/coverage-plan.json`

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `event-envelope`: событие имеет единый общий контракт, scope, privacy class и redaction state.
- foundation-сценарии для `experience`, `action`, `cost`: payload families используют общий envelope.
- MVP-сценарии scope-матрицы: `project`, `task`, `workflow-step`, `workbench-instance` являются единственными допустимыми комбинациями первого шага.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- fixture envelope для `experience`, `action`, `cost`;
- негативные fixture на отсутствующие обязательные поля и запрещённые scope-комбинации;
- live credentials не нужны.

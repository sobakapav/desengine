## Tasks

- [ ] 1. Зафиксировать OpenSpec capability/scenarios для cost-accounting (project/task scopes).
- [ ] 2. Определить MVP-контракт `CostEvent` и `CostAggregate` (поля, ограничения, приватность).
- [ ] 3. Определить источники событий и точки интеграции:
  - [ ] 3.1 LLM usage → `llm_tokens` (автоматически)
  - [ ] 3.2 ручной учёт времени → `manual_time` (минимальный UX/API)
  - [ ] 3.3 использование экспертизы → `expertise_usage` (контракт, даже если пока без реализации)
- [ ] 4. Реализовать хранение и агрегацию (MVP, локально).
- [ ] 5. Добавить минимальные представления (summary по проекту/задаче).
- [ ] 6. Экспорт/удаление данных учёта (privacy control).
- [ ] 7. Тесты и интеграция в общий слой тестирования:
  - [ ] 7.1 Unit: агрегация и валидация
  - [ ] 7.2 Traceability: обновить соответствие OpenSpec ↔ тесты
- [ ] 8. Зафиксировать команды проверки:
  - [ ] 8.1 `npm run test:unit`
  - [ ] 8.2 `npm run test:traceability`

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run ...`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия


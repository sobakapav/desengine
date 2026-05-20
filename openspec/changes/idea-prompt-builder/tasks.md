## Tasks

- [ ] 1. Зафиксировать OpenSpec capability/scenarios для Prompt Builder.
- [ ] 2. Определить MVP-модель `PromptBlock`/`PromptBuilderDraft` и контракт компиляции.
- [ ] 3. Реализовать компиляцию builder в итоговый промпт (без форка pipeline).
- [ ] 4. Добавить минимальный UX:
  - [ ] 4.1 Переключатель режимов (text vs builder)
  - [ ] 4.2 Редактор блоков (добавить/удалить/вкл-выкл)
  - [ ] 4.3 Preview итогового промпта
- [ ] 5. Интеграция запуска и логирования:
  - [ ] 5.1 Запуск через текущий pipeline
  - [ ] 5.2 (если включён `experience`) логирование draft/compiled prompt
- [ ] 6. Тесты и интеграция в общий слой тестирования:
  - [ ] 6.1 Unit: compile/serialize/limits
  - [ ] 6.2 Traceability: связать OpenSpec ↔ тесты
  - [ ] 6.3 (опционально) E2E smoke
- [ ] 7. Команды проверки зафиксировать:
  - [ ] 7.1 `npm run test:unit`
  - [ ] 7.2 `npm run test:traceability`
  - [ ] 7.3 (если добавлен e2e) `npm run test:e2e`

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run ...`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия


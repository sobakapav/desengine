## Tasks

- [ ] 1. Зафиксировать OpenSpec capability/scenarios для `experience` и `skill-synthesis`.
- [ ] 2. Определить MVP-контракт `ExperienceEvent` / `Experiment` (с лимитами и redaction).
- [ ] 3. Реализовать MVP-сбор данных:
  - [ ] 3.1 Точки захвата (prompt/code/error) — минимальный набор
  - [ ] 3.2 Хранилище (локально) + операции export/delete
  - [ ] 3.3 Управление пользователем (on/off, scope)
- [ ] 4. Реализовать MVP-workflow «создать навык из эксперимента»:
  - [ ] 4.1 Выбор эксперимента/событий
  - [ ] 4.2 Генерация черновика навыка
  - [ ] 4.3 Сохранение навыка + связь с источниками
- [ ] 5. Тесты и интеграция в общий слой тестирования:
  - [ ] 5.1 Unit: схема/валидация/лимиты/redaction
  - [ ] 5.2 Traceability: обновить соответствие OpenSpec ↔ тесты
  - [ ] 5.3 (опционально) E2E smoke: end-to-end путь «события → навык»
- [ ] 6. Зафиксировать команды проверки:
  - [ ] 6.1 `npm run test:unit`
  - [ ] 6.2 `npm run test:traceability`
  - [ ] 6.3 (если добавлен e2e) `npm run test:e2e`

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run ...`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия


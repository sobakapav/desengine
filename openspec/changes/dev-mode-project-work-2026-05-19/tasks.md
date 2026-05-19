## Tasks

Технический backlog реализации ведётся в issue:
- https://github.com/sobakapav/desengine/issues/10

Ниже остаются продуктовые шаги и тестовая трассировка change.

- [ ] 1. Зафиксировать OpenSpec capability/scenarios для `dev-mode` и `projects`.
- [ ] 2. Определить контракт `Project` / `Project Workspace` и места хранения (MVP).
- [ ] 3. Добавить UI/поток управления проектами:
  - [ ] 3.1 Создание проекта
  - [ ] 3.2 Выбор активного проекта без перезагрузки
  - [ ] 3.3 Базовое управление (rename/delete) — если допустимо
- [ ] 4. Сделать проектный контекст «сквозным» для ключевых потоков:
  - [ ] 4.1 Sandpack preview читает настройки из `project.settings`
  - [ ] 4.2 Данные задач/истории начинают быть project-scoped (минимальный срез)
- [ ] 5. Совместимость:
  - [ ] 5.1 Default project для существующих пользователей/данных
  - [ ] 5.2 План миграции: что проектное сейчас, что позже
- [ ] 6. Тесты и интеграция в общий слой тестирования:
  - [ ] 6.1 Unit: project store + scoping данных
  - [ ] 6.2 Traceability: обновить соответствие OpenSpec ↔ тесты
  - [ ] 6.3 E2E smoke: создание/переключение проектов и проверка изоляции
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

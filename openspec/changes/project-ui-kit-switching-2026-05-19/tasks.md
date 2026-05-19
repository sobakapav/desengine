## Tasks

Технический backlog реализации ведётся в issue:
- https://github.com/sobakapav/desengine/issues/8

Ниже остаются продуктовые шаги и тестовая трассировка change.

- [ ] 1. Зафиксировать OpenSpec сценарии для проекта, выбора UI kit и режима `html-tags`.
- [ ] 2. Ввести минимальную сущность `Project` и хранилище конфигурации проекта (MVP для лаборатории).
- [ ] 3. Подключить `project.uiKitId` к сборке Sandpack payload; обеспечить переключение без перезагрузки.
- [ ] 4. Добавить режим `uiMode=html-tags`:
  - [ ] 4.1 Валидация: разрешены только HTML-теги.
  - [ ] 4.2 Поведение в preview: базовые зависимости React, без UI kit.
- [ ] 5. Добавить диагностику совместимости и безопасный fallback (без падения лаборатории).
- [ ] 6. Тесты и интеграция в общий слой тестирования:
  - [ ] 6.1 Unit: нормализация/валидация `uiKitId` и `uiMode`, поведение `html-tags`.
  - [ ] 6.2 Component/browser или e2e smoke: переключение `uiKitId` в лаборатории без перезагрузки.
  - [ ] 6.3 Traceability: обновить соответствие OpenSpec ↔ тесты.
- [ ] 7. Команды проверки зафиксировать в change и в документации тестового слоя:
  - [ ] 7.1 `npm run test:unit`
  - [ ] 7.2 `npm run test:traceability`
  - [ ] 7.3 (при добавлении e2e) `npm run test:e2e`

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run ...`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия

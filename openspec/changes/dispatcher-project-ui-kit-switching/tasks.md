## Tasks

Технический backlog реализации ведётся в issue:
- https://github.com/sobakapav/desengine/issues/8

Ниже остаются продуктовые шаги и тестовая трассировка change.

- [x] 1. Зафиксировать OpenSpec сценарии для проекта, выбора UI kit и режима `html-tags`.
- [x] 2. Ввести минимальную сущность `Project` и хранилище конфигурации проекта (MVP для лаборатории).
- [x] 3. Подключить `project.uiKitId` к сборке Sandpack payload; обеспечить переключение без перезагрузки.
- [x] 4. Добавить режим `uiMode=html-tags`:
  - [x] 4.1 Валидация: разрешены только HTML-теги.
  - [x] 4.2 Поведение в preview: базовые зависимости React, без UI kit при `project.uiKitId=none`.
- [x] 5. Добавить диагностику совместимости и безопасный fallback (без падения лаборатории).
- [x] 6. Тесты и интеграция в общий слой тестирования:
  - [x] 6.1 Unit: нормализация/валидация `uiKitId` и `uiMode`, поведение `html-tags`.
  - [x] 6.2 Unit/source-level проверка переключения `uiKitId` без перезагрузки через query-state Sandpack payload; ручной browser smoke в `/lab/oncor-row` подтвердил переключение `shadcn → none → ant` без смены URL и html-tags диагностику/fallback.
  - [x] 6.3 Traceability: обновить соответствие OpenSpec ↔ тесты.
- [x] 7. Команды проверки зафиксировать в change и в документации тестового слоя:
  - [x] 7.1 `npm run test:unit`
  - [x] 7.2 `npm run test:traceability`
  - [x] 7.3 `npm run build`

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `level-labs`, `task`.
- [x] Выбрать уровень проверки: unit/source-contract для project runtime, Sandpack payload и html-tags fallback.
- [x] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:unit`, `npm run test:traceability`, `npm run build`; browser smoke выполнен через локальный mock allowlist без изменения кода.
- [x] Описать mock/fixture-данные и live credentials: используются inline component fixtures, live credentials не нужны.
- [x] Покрытие не откладывается для unit/source-contract слоя; отдельный e2e test не добавлялся, потому что browser smoke выполнен вручную и не требует live credentials.

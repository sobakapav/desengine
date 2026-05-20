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
- [x] 6.1 Unit: нормализация/валидация `uiKitId` и `uiMode`, поведение `ui-kit` по умолчанию и `html-tags`.
  - [x] 6.2 Unit/source-level проверка переключения `uiKitId` без перезагрузки через query-state Sandpack payload; ручной browser smoke в `/lab/oncor-row` подтвердил переключение `shadcn → none → ant` без смены URL и html-tags диагностику/fallback.
  - [x] 6.3 Traceability: обновить соответствие OpenSpec ↔ тесты.
- [x] 7. Команды проверки зафиксировать в change и в документации тестового слоя:
  - [x] 7.1 `npm run test:unit`
  - [x] 7.2 `npm run test:traceability`
  - [x] 7.3 `npm run build`
- [x] 8. Автоматизировать browser smoke переключения UI kit:
  - [x] 8.1 Добавить Playwright spec для `shadcn → none → ant` без live credentials через fixture-доступ.
  - [x] 8.2 Зафиксировать команду запуска targeted e2e smoke.
- [x] 9. Поднять runtime-ошибки Sandpack preview в host-level диагностику рядом с preview.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `level-labs`, `task`.
- [x] Выбрать уровень проверки: unit/source-contract для project runtime, Sandpack payload, сохранения shadcn в режиме `ui-kit` и html-tags fallback.
- [x] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать команду проверки: `npm run test:unit`, `npm run test:traceability`, `npm run build`; browser smoke выполнен через локальный mock allowlist без изменения кода.
- [x] Зафиксировать targeted e2e-команду: `DESENGINE_E2E_FIXTURE_ACCESS=1 npm run test:e2e -- test/e2e/project-ui-kit-switching.spec.ts`.
- [x] Описать mock/fixture-данные и live credentials: используются inline component fixtures, live credentials не нужны.
- [x] Описать e2e fixture-доступ: тест сам создаёт signed access cookie с `DESENGINE_E2E_ACCESS_SALT` или дефолтной тестовой солью; live allowlist не нужен.
- [x] Покрытие не откладывается: unit/source-contract слой и targeted e2e smoke добавлены; live credentials не требуются.

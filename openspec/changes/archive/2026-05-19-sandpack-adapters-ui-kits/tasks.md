## 1. Спецификация и контракт

- [ ] 1.1 Обновить `openspec/specs/task/spec.md`: зафиксировать сценарий выбора UI kit для Sandpack preview (включая fallback при неизвестном `uiKitId`).
- [ ] 1.2 Обновить `openspec/specs/level-labs/spec.md`: определить, где и как уровень/задача задаёт `uiKitId` (или явно зафиксировать, что это task-owned настройка).

## 2. Конфигурация UI kit'ов (внешний файл)

- [ ] 2.1 Добавить внешний конфигурационный файл для UI kit'ов (предварительно: `lib/lab/sandpack-ui-kits.config.ts`), где перечислены поддерживаемые kit'ы и их npm-зависимости/файлы.
- [ ] 2.2 Определить формат конфига и правила валидации (минимальный shape, уникальность `id`, запрет пустых `dependencies` там, где они ожидаются).

## 3. Runtime-адаптеры Sandpack

- [ ] 3.1 Реализовать `resolveSandpackUiKit(uiKitId)` и `applySandpackUiKitAdapter(...)` в runtime-слое Sandpack preview.
- [ ] 3.2 Интегрировать adapter в сборку Sandpack payload (выбор kit'а + применение к payload).
- [ ] 3.3 Добавить минимальный стартовый набор kit'ов в конфиг (включая хотя бы один внешний UI kit через npm-пакеты) и описать критерии добавления новых kit'ов.

## 4. Тестовая часть change (обязательная)

- [ ] Указать затронутые OpenSpec capability/scenarios
  - capability: `task`
    - scenario: "Preview принимает UI-импорты из components/ui"
    - scenario: "Preview применяет выбранный UI kit adapter (uiKitId) без падений и с fallback"
  - capability: `level-labs`
    - scenario: "Пользователь открывает рабочий экран на desktop" (preview должен продолжать работать)
- [ ] Выбрать уровень проверки: unit + static/traceability
- [ ] Добавить или обновить тесты в общем слое тестирования
  - unit: тесты на резолв `uiKitId` и применение adapter'а к Sandpack payload (merge package.json deps, добавление файлов)
  - unit: тест на валидацию внешнего конфига (уникальность id, обязательные поля)
- [ ] Зафиксировать команду проверки: `npm run test:unit && npm run test:traceability`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
  - mock/fixtures не нужны (используется репозиторный конфиг и локальные шаблоны)
  - live credentials не нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия

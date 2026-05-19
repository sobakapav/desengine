## 1. Вынести Sandpack-шаблоны на диск

- [x] 1.1 Добавить каталог `lib/lab/sandpack-templates/default/` с файлами виртуального проекта (html/tsx/config/css).
- [x] 1.2 Перенести текущие значения шаблонов из `lib/lab/sandpack-preview.ts` в эти файлы без изменения содержимого.

## 2. Подгрузка шаблонов при сборке payload

- [x] 2.1 Добавить лоадер шаблонов с чтением с диска и in-memory кэшем.
- [x] 2.2 Обновить `buildSandpackPreviewPayload(...)`, чтобы он использовал файлы с диска (и fallback, если файлов нет).
- [x] 2.3 Зафиксировать поведение в dev: кэш в dev выключен, в production включён.

## 3. Production-упаковка шаблонов

- [x] 3.1 Обеспечить попадание `lib/lab/sandpack-templates/**` в production build Next.js (file tracing include или альтернативный подход).
- [x] 3.2 Добавить понятную диагностику, если шаблоны не найдены в production (лог + fallback-стратегия без падения).

## 4. Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
  - capability: `task`
    - scenario: "Preview принимает UI-импорты из components/ui"
  - capability: `level-labs`
    - scenario: "Пользователь открывает рабочий экран на desktop" (косвенно: preview должен продолжать работать)
- [x] Выбрать уровень проверки: unit + static/traceability
- [x] Добавить или обновить тесты в общем слое тестирования
  - unit: обновить/расширить `test/unit/sandpack-preview.test.ts`, чтобы гарантировать, что payload формируется стабильно после переноса шаблонов на диск
  - при необходимости: добавить отдельный unit-тест на лоадер шаблонов (чтение с диска + fallback)
- [x] Зафиксировать команду проверки: `npm run test:unit && npm run test:traceability`
- [x] Описать mock/fixture-данные и live credentials, если они нужны
  - mock/fixtures не нужны: шаблоны лежат в репозитории
  - live credentials не нужны
- [x] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия

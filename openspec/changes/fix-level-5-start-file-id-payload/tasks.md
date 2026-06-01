## Tasks

- [x] 1. Зафиксировать bugfix contract для start payload, который возвращает `fileId` или `fileName` вместо содержимого.
- [x] 2. Добавить unit-тест на нормализацию start payload для `Component.tsx` и `Component.stories.ts`.
- [x] 3. Расширить start fallback-слой:
  - [x] 3.1 трактовать `file.id` / `file.fileName` как placeholder, а не как валидный контент;
  - [x] 3.2 подставлять текущее содержимое файла, если оно уже есть;
  - [x] 3.3 подставлять минимальный scaffold для `Component.tsx` и `Component.stories.ts`, если содержимого ещё нет.
- [x] 4. Убедиться, что validator по-прежнему отклоняет некорректный payload вне этого repair-path.
- [x] 5. Подготовить change к внешней проверке.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать команду проверки
- [x] Добавить или обновить тесты
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `llm` / `Система выполняет start`
  - `task` / `Пользователь запускает уровень через service boundary`
  - `component-file-set` / `Набор файлов компонента фиксирован на MVP`
- Уровень проверки: unit + traceability
- Команды запуска:
  - `npm run test:unit -- test/unit/task-start-llm.test.ts test/unit/workbench-output.test.ts`
  - `npm run test:traceability`
- Mock/fixture-данные:
  - synthetic start payload с `component` / `Component.tsx` / `Component.stories.ts` вместо кода;
  - live credentials не нужны.

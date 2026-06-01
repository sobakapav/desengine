## Tasks

- [x] 1. Зафиксировать render-contract `level-5` для `mock.ts` как массива вариантов.
- [x] 2. Добавить `onboarding/levels/level-5/sandpack/App.tsx`.
- [x] 3. Реализовать правило прямого рендера:
  - [x] 3.1 импортировать `Component` и читать данные через `mockModule`
  - [x] 3.2 если `mockProps ?? mock` даёт plain object, сохранить приоритетный одиночный рендер
  - [x] 3.3 только если явных одиночных props нет и `mock` является массивом, для каждого элемента массива отрисовывать `Component`
  - [x] 3.4 не добавлять эвристики, merge и дополнительную нормализацию поверх массива
- [x] 4. Обновить unit-покрытие level-template/preview под `level-5`.
- [x] 5. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать команду проверки
- [x] Добавить или обновить тесты
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `level-labs` / `Система выбирает Sandpack App template по уровню задачи`
  - `component-file-set` / `mock.ts` используется как примеры данных для демонстрации
- Уровень проверки: unit + traceability
- Команда запуска:
  - `npm run test:unit -- test/unit/sandpack-template.test.ts test/unit/sandpack-preview.test.ts`
  - `npm run test:traceability`
- Mock/fixture-данные:
  - level-owned template в `onboarding/levels/level-5/sandpack/App.tsx`
  - fixture/source `mock.ts` с массивом элементов
  - live credentials не нужны

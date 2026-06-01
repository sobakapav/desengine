## Tasks

- [ ] 1. Зафиксировать render-contract `level-5` для `mock.ts` как массива вариантов.
- [ ] 2. Добавить `onboarding/levels/level-5/sandpack/App.tsx`.
- [ ] 3. Реализовать правило прямого рендера:
  - [ ] 3.1 импортировать `Component` и `mock`
  - [ ] 3.2 для каждого элемента `mock`-массива отрисовывать `Component` с данными этого элемента
  - [ ] 3.3 не добавлять эвристики, merge и дополнительную нормализацию поверх массива
- [ ] 4. Обновить unit-покрытие level-template/preview под `level-5`.
- [ ] 5. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать команду проверки
- [ ] Добавить или обновить тесты
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

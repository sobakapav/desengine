## Tasks

- [x] 1. Зафиксировать OpenSpec-контракт для явной сущности `UI kit adapter` и встроенной модели установки.
- [x] 2. Вынести поддержанные UI kit'ы в единый каталог Node.js и оформить общий adapter registry.
- [x] 3. Перевести project/runtime surfaces на чтение через adapter registry.
- [x] 4. Поднять control управления UI kit в верхний слой страницы проекта и показать пояснение о встроенной модели и политике кастомизации.
- [x] 5. Обновить source-contract тесты и traceability под новую adapter model.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
  - `projects`: верхний control управления `uiKitId` и чтение списка из adapter registry.
  - `ui-kit-adapters`: встроенные адаптеры, единый каталог и системная ownership-модель.
- [x] Выбрать уровень проверки
  - static/source-contract;
  - unit.
- [x] Добавить или обновить тесты
  - unit/source-contract для реестра и контракта встроенных адаптеров;
  - unit/source-contract для верхнего project control управления UI kit.
- [x] Зафиксировать команду проверки
  - `npm run test:unit -- project-user-surface-foundation ui-kit-adapter-registry`
  - `npm run test:traceability`
- [x] Описать mock/fixture-данные и live credentials, если нужны
  - live credentials не нужны;
  - достаточно file/source-contract чтения registry и project surfaces.

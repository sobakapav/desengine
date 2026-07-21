## Tasks

- [x] 1. Обновить OpenSpec-контракт project storage и project surface под disk-backed модель.
- [x] 2. Реализовать server-side disk storage adapter для project registry, active project, workspace, components, session и history.
- [x] 3. Добавить user-facing flows создания проекта по server path и подключения внешнего проекта с диска.
- [x] 4. Перевести project page и project product surfaces на server-backed autosave без browser-local source of truth и без compatibility fallback.
- [x] 5. Удалить legacy runtime-следы из active project materials и active OpenSpec changes, не трогая архив.
- [ ] 6. Обновить и добавить unit/source-contract тесты и traceability под новый disk-backed contract.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios:
  - `projects`: создание проекта по server path, подключение внешнего проекта, disk-backed autosave, project path как основной рабочий контур.
  - `storage-adapter`: project storage adapter работает поверх disk-backed JSON/filesystem backend.
  - `project-api`: project-facing import/export не зависит от legacy storage keys.
- [x] Выбрать уровень проверки:
  - static/contract;
  - unit;
  - component/browser не обязателен в этой волне;
  - integration/e2e smoke не обязателен, если source-contract и unit закрывают server path flows.
- [ ] Добавить или обновить тесты:
  - unit для disk storage adapter и on-disk format;
  - unit/source-contract для project create/connect flows;
  - unit/source-contract для удаления browser-local compatibility и legacy runtime-следов из active project path.
- [x] Зафиксировать команду проверки:
  - `npm run test:unit -- project`
  - `npm run test:traceability`
- [x] Описать mock/fixture-данные и live credentials:
  - использовать временные каталоги и JSON fixtures в `/tmp` или test temp dirs;
  - live credentials не требуются;
  - если browser/e2e-покрытие откладывается, отразить это в `test/traceability/coverage-plan.json`.

## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
  - `workbench`:
    - `WorkbenchInstance связан с project/task/workflow step`
  - `projects`:
    - `Пользователь создаёт первый проект в MVP workspace`
    - `Пользователь переключает active project через project registry`
    - `Смена project UI kit запускает явную migration-операцию`
- [x] Выбрать уровень проверки
  - `unit`
- [x] Добавить или обновить тесты
  - Обновлены source/unit-контракты в `test/unit/project-ui-kit-switching.test.ts` и `test/unit/ui-kit-switcher-visibility.test.ts` под новые модули `WorkbenchProjectShell.tsx` и `useWorkbenchProjectScope.ts`.
- [x] Зафиксировать команду проверки
  - `npm run test:unit -- test/unit/task-project-client-boundary.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts test/unit/workbench-platform-registry.test.ts`
- [x] Описать mock/fixture-данные и live credentials, если нужны
  - Используются только локальные unit/source-fixture данные из test-набора; live credentials не нужны.

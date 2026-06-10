## Tasks

- [x] 1. Уточнить постановку и границы реализации:
  - [x] 1.1 подтвердить, что mismatch приходит из project summary блока и включает расхождение по самому `project` до hydration effect;
  - [x] 1.2 зафиксировать минимальную границу fix без пересмотра project/runtime контракта.
- [x] 2. Внести кодовые изменения:
  - [x] 2.1 убрать нестабильный SSR/CSR рендер `updatedAt` в Workbench;
  - [x] 2.2 выровнять initial render project summary между SSR и первым client render;
  - [x] 2.3 сохранить читаемый пользовательский вывод без ложного hydration mismatch.
- [x] 3. Добавить или обновить точечные проверки для hydration-safe contract Workbench.
- [x] 4. Подготовить bookkeeping change:
  - [x] 4.1 обновить release note для `release-2026-06-10-architecture`;
  - [x] 4.2 отметить выполненные пункты и подготовить change к внешней проверке без самостоятельной финальной верификации.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `workbench`: Workbench показывает project metadata без нестабильной гидрации первого экрана.
- `projects`: active project metadata не создаёт ложный hydration mismatch при первом render.

Уровень проверки:
- unit/source-contract для Workbench render contract.

Команда проверки:
- `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts`

Mock/fixture-данные и credentials:
- fixture-данные: локальный `ProjectWorkspace` с заполненным `updatedAt` и Workbench source-contract assertions.
- live credentials не нужны.

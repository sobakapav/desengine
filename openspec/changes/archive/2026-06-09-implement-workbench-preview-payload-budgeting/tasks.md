## Tasks

- [x] 1. Зафиксировать contract preview payload budgeting для Workbench.
- [x] 2. Ускорить pipeline сборки preview:
  - [x] 2.1 сократить повторное чтение стабильных runtime-источников;
  - [x] 2.2 уменьшить количество лишних rebuild'ов preview payload;
  - [x] 2.3 выделить cache key и reuse policy для тяжёлых derived artifacts.
- [x] 3. Ввести guardrail'ы на preview resource path:
  - [x] 3.1 ограничить рост in-memory cache;
  - [x] 3.2 определить safe degradation path при превышении budget;
  - [x] 3.3 не допустить бесконтрольного роста CPU/RAM на стороне пользовательской машины.
- [x] 4. Добавить или обновить тесты и traceability.
- [x] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `workbench`, `level-labs`.
- [x] Выбрать уровень проверки: unit + component/browser.
- [x] Добавить или обновить тесты в общем слое тестирования.
- [x] Зафиксировать unit-команду проверки: `npm run test:unit -- test/unit/sandpack-preview.test.ts`.
- [x] Зафиксировать команду проверки: `DESENGINE_E2E_FIXTURE_ACCESS=1 npm run test:e2e -- test/e2e/sandpack-preview-style-runtime.spec.ts`.
- [x] Зафиксировать test data contract: использовать fixture-режим `DESENGINE_E2E_FIXTURE_ACCESS=1`, не требовать live credentials и не зависеть от provider/network path.
- [x] Зафиксировать правило для coverage-plan: если budget/degradation проверка не влезает в эту волну, добавить запись в `test/traceability/coverage-plan.json` с указанием, какая именно preview-ветка осталась без покрытия и чем она будет закрыта.

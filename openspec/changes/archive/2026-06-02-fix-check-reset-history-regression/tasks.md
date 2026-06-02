- [x] 1. Подтвердить границы регресса в reset-flow.
- [x] 2. Выровнять очистку истории уточнений и результата проверки с reset scope задачи или текущего уровня.
- [x] 3. Убедиться, что bugfix не затрагивает уже завершённые уровни.
- [x] 4. Поддержать regression guard через browser verification.

## Test and Traceability

- Capability: `iteration`
- Scenarios:
  - `Пользователь сбрасывает задачу`
  - `Пользователь сбрасывает только текущий уровень`
- Уровень проверки: `component/browser`
- Команды:
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-reset-granularity.spec.ts`
- Mock / fixture-данные: browser fixtures из `test/e2e/level-reset-granularity.spec.ts`, которые поднимают многоуровневую задачу с историей уточнений и результатом проверки для `reset task` и `reset current level`.
- Live credentials: не нужны.

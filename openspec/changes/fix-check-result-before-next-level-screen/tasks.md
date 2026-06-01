## Tasks

- [ ] 1. Локализовать текущий источник неправильного перехода после успешного `check`.
- [ ] 2. Исправить порядок экранов так, чтобы результат проверки показывался раньше следующего уровня.
- [ ] 3. Проверить, что change не ломает flow последнего уровня и полного завершения задачи.
- [ ] 4. Добавить browser/e2e покрытие на правильный порядок экранов после успешной проверки.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task-levels`: пользователь открывает результат проверки по каноническому route.
- `task-levels`: проверка уровня успешна.

Уровни проверки:
- component/browser: обязательный.
- unit: допустим как вспомогательный слой для state/navigation logic.

Команды запуска:
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/check-result-before-next-level-screen.spec.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- browser/e2e должен использовать fixture-доступ и детерминированный успешный `check` path без live LLM.

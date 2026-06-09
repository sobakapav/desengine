## Tasks

- [x] 1. Зафиксировать точку post-success перехода к списку задач уровня.
- [x] 2. Реализовать возврат к списку задач уровня после успеха.
- [x] 3. Уточнить, в каких сценариях возврат действует всегда, а где возможны исключения.
- [x] 4. Добавить или обновить проверки маршрута и traceability.
- [x] 5. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task-levels`: потенциальная смена маршрута после успешного завершения задачи.
- `user-progress`: потенциальная смена точки возврата и представления прогресса.

Уровни проверки:
- static/contract: обязательный.
- unit: по необходимости, если меняется вычисление маршрута и прогресса.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: обязателен, change меняет пользовательский маршрут после успешного завершения задачи.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/check-result-before-next-level-screen.spec.ts`

Mock/fixture-данные и credentials:
- нужны данные/фикстуры со сценарием успешного завершения задачи;
- live credentials не нужны.

## Tasks

- [ ] 1. Отследить, где один пользовательский iterate может учитываться дважды.
- [ ] 2. Исправить mutation/projection слой так, чтобы одно уточнение увеличивало счётчик только на 1.
- [ ] 3. Добавить unit-тесты на единичный инкремент и на правильный остаток лимита.
- [ ] 4. Обновить OpenSpec/traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `user-progress`: число использованных промптов на текущем уровне должно быть точным.
- `task-levels`: лимит уточняющих промптов не должен расходоваться быстрее заявленного.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit && npm run test:traceability`

Mock/fixture-данные и credentials:
- Нужны локальные fixture task-progress и prompt-history.

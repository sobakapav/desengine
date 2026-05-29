## Tasks

- [ ] 1. Отследить источник дрейфа между task-state, current level, overview-описанием, preview и reset-flow.
- [ ] 2. Зафиксировать контракт детерминированного reopen/reset для задачи.
- [ ] 3. Исправить восстановление состояния задачи так, чтобы:
  - [ ] 3.1 описание не пропадало при повторном входе;
  - [ ] 3.2 переход на следующий уровень не возвращал пользователя в противоречивое состояние;
  - [ ] 3.3 reset не менял вариант/артефакт вне ожидаемого сценария.
- [ ] 4. Добавить unit/source-contract проверки на reopen/reset/level-transition.
- [ ] 5. Обновить OpenSpec delta и traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task-levels`: переход на следующий уровень и reopen не должны ломать текущий task-state.
- `user-progress`: текущий уровень и его состояние должны восстанавливаться согласованно.
- `iteration`: reset и повторный вход не должны вести к скрытой подмене файлового состояния.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: можно отложить, если unit/source-contract достаточно локализует проблему.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit && npm run test:traceability`

Mock/fixture-данные и credentials:
- Нужны локальные fixture task-state и prompt/check history без live credentials.

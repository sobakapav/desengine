## Контекст

- Родительский `producer-project` уже зафиксировал стратегию внедрения `Project`, но оставил в `design.md` открытым именно тот вопрос, который в `proposal/tasks` уже был обещан как решённый: точную downstream decomposition и verification-рамку будущих волн.
- Этот fix change исправляет только producer-level contract и не меняет product/runtime решения.

## Решение

- Убрать из `producer-project/design.md` открытый вопрос о том, как именно делить downstream project-waves, и заменить его нормативной MVP decomposition.
- Синхронизировать `producer-project/proposal.md` и `producer-project/tasks.md` с этой decomposition, чтобы producer обещал ровно то, что сам же уже фиксирует.
- Добавить в producer-level artifacts минимальную verification-матрицу для foundation/task/workflow/workbench/migration waves:
  - уровни проверки;
  - обязательные command families;
  - project-aware mock/fixture expectations;
  - обязательное правило `coverage-plan` при отсрочке покрытия.

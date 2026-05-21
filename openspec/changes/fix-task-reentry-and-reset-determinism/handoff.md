## Миссия

- Превратить reopen/reset/level-transition из источника дрейфа в детерминированный task-state flow.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` требует нормализовать жалобу до наблюдаемой проблемы и закрепить её в downstream `fix`.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/focus-quality/roadmaps/bugfix-dispatching.md
- openspec/specs/task-levels/spec.md
- openspec/specs/user-progress/spec.md
- openspec/specs/iteration/spec.md

## Границы исполнения

- Что входит в этот change: reopen/reset/transition consistency, связность описания и preview, детерминированность task-state.
- Что сознательно не входит: полная переработка task UX вне наблюдаемого бага.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit && npm run test:traceability
- Что именно должен доказать результат проверки: жалоба воспроизводима как контрактный gap и закрыта автоматическими проверками.

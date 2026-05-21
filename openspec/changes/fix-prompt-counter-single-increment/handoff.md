## Миссия

- Закрыть double-count bug в prompt counter так, чтобы один пользовательский iterate всегда равнялся одной списанной попытке.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night

## Обязательные источники

- lib/task/actions/iterate.ts
- lib/task/server-runtime-progress.ts
- openspec/specs/user-progress/spec.md
- openspec/specs/task-levels/spec.md

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit && npm run test:traceability
- Что именно должен доказать результат проверки: одна отправка не удваивает progress/promptsUsed ни в storage, ни в проекции.

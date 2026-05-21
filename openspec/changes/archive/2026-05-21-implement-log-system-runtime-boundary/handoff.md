## Миссия

- Этот change передан мне, Codex, как исполнителю.
- Что должен изменить этот change: реализовать ровно один runtime entrypoint записи product event и один default `stub/no-op` adapter, чтобы следующие changes не проектировали boundary заново.

## Унаследованный контекст

- parent_change: dispatcher-log-system
- strategy_root: focus-product
- release_ref: release-2026-05-21-day
- Что из родительского change уже решено: `dispatcher-log-system` является sibling-контуром к `dispatcher-event-envelope`, а первый заход здесь ограничен boundary без storage, без producers и без пользовательских flow.

## Обязательные источники

- `openspec/changes/dispatcher-log-system/proposal.md`
- `openspec/changes/dispatcher-log-system/design.md`
- `openspec/changes/implement-event-envelope-contract/proposal.md`
- `openspec/changes/implement-log-system-runtime-boundary/proposal.md`
- `openspec/changes/implement-log-system-runtime-boundary/design.md`
- `openspec/changes/implement-log-system-runtime-boundary/tasks.md`

## Границы исполнения

- Что входит в этот change: один `recordEvent`-entrypoint или его эквивалент, adapter contract, один `stub/no-op` sink, unit/service tests и traceability.
- Что сознательно не входит: persistent storage, `in-memory` storage как отдельный режим хранения, producer wiring, export/delete, analytics, глобальные пользовательские flow.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit`
- Что именно должен доказать результат проверки: downstream change может использовать один готовый entrypoint без перепроектирования sink contract и без принятия решений про storage.

## Открытые вопросы

- Найти место boundary так, чтобы она не выглядела как временный helper рядом с одним consumer.
- Проверить, не нужно ли сразу дать минимальный internal API для тестового harness, не создавая второго entrypoint.

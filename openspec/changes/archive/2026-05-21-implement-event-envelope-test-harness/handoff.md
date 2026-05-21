## Миссия

- Этот change передан мне, Codex, как исполнителю.
- Что должен изменить этот change: собрать один reusable test harness для foundation event-линии, чтобы envelope и runtime-boundary проверялись через общий baseline, а не через локальные ad-hoc fixtures.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-05-21-day
- Что из родительского change уже решено: для первой event-line волны нужен общий traceability-контур и понятные правила отложенного покрытия.

## Обязательные источники

- `openspec/changes/dispatcher-test-system/proposal.md`
- `openspec/changes/implement-event-envelope-contract/proposal.md`
- `openspec/changes/implement-log-system-runtime-boundary/proposal.md`
- `openspec/changes/implement-event-envelope-test-harness/proposal.md`
- `openspec/changes/implement-event-envelope-test-harness/design.md`
- `openspec/changes/implement-event-envelope-test-harness/tasks.md`

## Границы исполнения

- Что входит в этот change: fixtures/builders для валидного и невалидного envelope, `stub/no-op` log boundary fixtures, helper'ы для unit/contract/service assertions, foundation traceability.
- Что сознательно не входит: producer-specific payload tests для `experience`/`action`/`cost`, browser/e2e пользовательских flow, live/provider coverage, storage-backed integration.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: foundation event-линия имеет один общий harness и не требует заново собирать тестовую базу в каждом downstream change.

## Открытые вопросы

- Нужно ли сразу фиксировать `coverage-plan.json` или этого можно избежать, если foundation coverage полностью закрыт.
- Где лучше хранить shared fixtures, чтобы они были reusable, но не начали мимикрировать под domain payload library.

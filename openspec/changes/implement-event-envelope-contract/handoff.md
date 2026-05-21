## Миссия

- Этот change передан мне, Codex, как исполнителю.
- Что должен изменить этот change: реализовать один переиспользуемый foundation-контракт `EventEnvelope`, чтобы downstream changes больше не проектировали свои event shape с нуля.

## Унаследованный контекст

- parent_change: dispatcher-event-envelope
- strategy_root: focus-product
- release_ref: release-2026-05-21-day
- Что из родительского change уже решено: MVP ограничен обязательными полями `eventId`, `kind`, `occurredAt`, `scope`, `privacyClass`, `redactionState`, `payload` и четырьмя scope-комбинациями `project`, `task`, `workflow-step`, `workbench-instance`.

## Обязательные источники

- `openspec/changes/research-event-envelope-experience-cost-boundary/proposal.md`
- `openspec/changes/dispatcher-event-envelope/proposal.md`
- `openspec/changes/dispatcher-event-envelope/design.md`
- `openspec/changes/implement-event-envelope-contract/proposal.md`
- `openspec/changes/implement-event-envelope-contract/design.md`
- `openspec/changes/implement-event-envelope-contract/tasks.md`

## Границы исполнения

- Что входит в этот change: общий тип/контракт `EventEnvelope`, validator/source-contract helper, MVP scope-матрица, fixtures/builders, unit/contract traceability.
- Что сознательно не входит: storage, runtime propagation, `recordEvent`, producer wiring, `schemaVersion`, correlation/causation metadata, расширение scope-матрицы за пределы MVP.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit`
- Что именно должен доказать результат проверки: существует один foundation-контракт envelope, который валидирует обязательные поля и допустимые scope-комбинации и пригоден для downstream reuse.

## Открытые вопросы

- Выбрать точное место контракта в кодовой базе без создания параллельного доменного слоя.
- Решить, нужен ли screen-safe view type рядом с общим envelope уже в этом change или только в downstream runtime propagation.

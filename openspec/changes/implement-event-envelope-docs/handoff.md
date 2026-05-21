## Миссия

- Этот change передан мне, Codex, как исполнителю.
- Что должен изменить этот change: задокументировать реальный MVP event-линии так, чтобы команда понимала foundation-контракт, runtime-boundary и наблюдаемый screen propagation flow как единую систему.

## Унаследованный контекст

- parent_change: dispatcher-doc
- strategy_root: focus-content
- release_ref: release-2026-05-21-day
- Что из родительского change уже решено: документация event-линии должна жить в отдельном docs-контуре и сопровождать MVP как обязательный deliverable.

## Обязательные источники

- `openspec/changes/dispatcher-doc/proposal.md`
- `openspec/changes/implement-event-envelope-contract/proposal.md`
- `openspec/changes/implement-screen-event-envelope-propagation/proposal.md`
- `openspec/changes/implement-log-system-runtime-boundary/proposal.md`
- `openspec/changes/implement-event-envelope-docs/proposal.md`
- `openspec/changes/implement-event-envelope-docs/design.md`
- `openspec/changes/implement-event-envelope-docs/tasks.md`
- релевантные `README.md` и `docs/**`, которые будут выбраны каноническими точками входа

## Границы исполнения

- Что входит в этот change: обновление root/profile docs, описание foundation `EventEnvelope`, runtime-boundary, MVP propagation flow, deferred-границ и команд проверки.
- Что сознательно не входит: help-страницы внутри UI, обещания про полную event-систему, документация несуществующих analytics/cost/experience integration.

## Проверка результата

- verification_level: traceability
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: документация синхронизирована с текущими change, test expectations и реальной MVP-границей event-линии.

## Открытые вопросы

- Какие документы лучше сделать каноническими для event-линии: root `README.md`, отдельный `docs/**` файл или их комбинацию.
- Нужно ли документировать screen propagation сразу как инженерный контракт или ещё и как продуктовый сценарий для пользователей/операторов.

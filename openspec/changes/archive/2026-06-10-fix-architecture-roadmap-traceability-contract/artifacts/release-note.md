## Что меняется для пользователя:

В архитектурной линии появляется активный OpenSpec-контракт `architecture-roadmap`, поэтому routing-playbook и его traceability больше не ссылаются на архивный или отсутствующий capability.

## Как это влияет на пользователя:

Менеджеру проекта и владельцам change-линий проще доверять архитектурным evidence: unit-доказательства routing-playbook теперь опираются на реальный active capability с понятными scenarios, а не на несуществующую запись в `openspec/specs/**`.

## Как проверить:

Открыть `openspec/specs/architecture-roadmap/spec.md` и убедиться, что там есть сценарии про routing через `dispatcher-architecture`, сохранение ownership у предметного dispatcher и обязательный evidence-пакет для boundary change. Затем внешней проверкой запустить `npm run test:unit -- test/unit/architecture-routing-playbook-docs.test.ts`.

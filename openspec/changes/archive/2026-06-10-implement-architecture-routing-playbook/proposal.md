## Why

`dispatcher-architecture` уже зафиксирован как tactical owner архитектурной линии, но у него пока нет практического playbook, по которому родитель быстро решает:

- когда change должен идти через `dispatcher-architecture`;
- когда change уже надо отдавать предметному dispatcher;
- какие доказательства обязательны, если downstream wave меняет архитектурную границу, naming discipline или контракт взаимодействия.

Без такого playbook dispatcher рискует стать либо универсальной свалкой архитектурных вопросов, либо декоративным change без пригодной operational-маршрутизации.

## What Changes

- Добавить practical playbook маршрутизации downstream changes в `docs/architecture/routing/playbook.md`.
- Зафиксировать отдельный документ по naming discipline для крупных модулей и архитектурных сущностей.
- Зафиксировать guidance по boundary/interaction contract, чтобы изменения границ не проходили без явного набора доказательств.
- Синхронизировать `handoff.md`, `design.md`, `tasks.md` и metadata самого change с этим документированным контрактом.

## Impact

- Родительская линия получает operational-критерии маршрутизации архитектурных changes.
- Предметные dispatcher changes получают понятный критерий, когда architectural review нужен только как evidence, а не как parent ownership.
- У внешней проверки появляется узкий unit-контракт на обязательное содержание playbook-документов.

## Acceptance Criteria

- В `docs/architecture` есть playbook маршрутизации, который различает `dispatcher-architecture` и предметные dispatcher-линии.
- В документации явно описаны naming discipline и требования к boundary/interaction contract.
- Playbook перечисляет обязательные evidence-артефакты для changes, которые меняют архитектурную границу.
- Артефакты `implement-architecture-routing-playbook` заполнены без плейсхолдеров и готовы к внешней проверке.

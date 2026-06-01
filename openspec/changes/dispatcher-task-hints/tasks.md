## Tasks

- [x] 1. Зафиксировать `dispatcher-task-hints` как активного owner change для линии task hints под `focus-onboarding`.
- [x] 2. Привязать линию к roadmap `focus-onboarding/roadmaps/task-hints.md`.
- [x] 3. Явно отделить dispatcher от downstream runtime changes:
  - [x] 3.1 runtime-контракты живут в capability `task` и `prompt-context`
  - [x] 3.2 concrete behavior changes идут отдельными `implement`/`fix` children
- [x] 4. Удерживать тестовую политику линии:
  - [x] 4.1 child behavior-changes обязаны перечислять capability/scenarios
  - [x] 4.2 child behavior-changes обязаны указывать verification level и команды
  - [x] 4.3 child behavior-changes обязаны фиксировать fixtures/credentials и traceability
- [x] 5. Сохранять release-трассировку на уровне child changes, а не dispatcher.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:

- `task`: линия task-specific hints сохраняет явную связь со сценариями статичного и шаблонного формата.
- `prompt-context`: template context для task hints остаётся общим downstream boundary, а не ad-hoc контрактом отдельной реализации.

Уровни проверки:

- static/contract: обязателен для dispatcher и всех child behavior-changes этой линии.
- unit: требуется на уровне child runtime-изменений, но не для самого dispatcher.
- component/browser: не требуется для самого dispatcher.
- integration: не требуется для самого dispatcher.
- e2e smoke: не требуется для самого dispatcher.
- live/provider: не требуется для самого dispatcher.

Команды запуска:

- `npm run test:traceability`

Mock/fixture-данные и credentials:

- Не требуются для самого dispatcher: он не меняет runtime напрямую.
- Если child change меняет поведение task hints, fixtures и credentials должны быть описаны в нём явно.

## Tasks

- [x] 1. Зафиксировать `dispatcher-tasks` как активного owner change для системы задач онбординга под `focus-onboarding`.
- [x] 2. Привязать линию к roadmap `focus-onboarding/roadmaps/tasks.md`.
- [x] 3. Явно отделить dispatcher от downstream runtime changes:
  - [x] 3.1 runtime-контракты живут в capability `task` и смежных capability
  - [x] 3.2 concrete behavior changes идут отдельными `implement`/`fix` children
- [x] 4. Удерживать тестовую политику линии:
  - [x] 4.1 child behavior-changes обязаны перечислять capability/scenarios
  - [x] 4.2 child behavior-changes обязаны указывать verification level и команды
  - [x] 4.3 child behavior-changes обязаны фиксировать fixtures/credentials и traceability
- [x] 5. Сохранять release-трассировку на уровне child changes, а не dispatcher.

## Текущий фокус реализации

- Для onboarding-линии в ближайшем приоритете удерживается переход task-системы в путь `проект -> workflow -> проверка/чеклист -> результат`.
- Побочные UX-эксперименты вне этого пути считаются отложенными.

## 6. Подготовить content-migration onboarding-задач

- [ ] 6.1 Поставить child change `implement-onboarding-project-workflow-migration-guide` под `dispatcher-tasks`.
- [ ] 6.2 Зафиксировать, что этот change должен дать контент-менеджеру практическую инструкцию по migration onboarding-задач и metadata.
- [ ] 6.3 Зафиксировать, что без этой content-wave UI-переход onboarding на новый режим не считается подготовленным.

## 7. Поставить UI-волны для нового режима

- [ ] 7.1 Поставить downstream wave на перевод onboarding task surfaces к проектному входу.
- [ ] 7.2 Поставить downstream wave на перевод onboarding task/task-list экранов на workflow-язык вместо level-центричного языка.
- [ ] 7.3 Поставить downstream wave на связку onboarding-задач с шагами проверки, повторной проверки и результата.
- [ ] 7.4 Поставить downstream wave на user-facing показ onboarding metadata только в нужной для нового режима форме.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:

- `task`: task-система сохраняет явную связь со сценариями каталога задач, уровней, progress и guidance.
- `prompt-context`: общий template context остаётся downstream boundary только для тех task changes, которые реально используют шаблонный guidance-слой.

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
- Если child change меняет поведение task catalog, task UI, task progress или task hints, fixtures и credentials должны быть описаны в нём явно.

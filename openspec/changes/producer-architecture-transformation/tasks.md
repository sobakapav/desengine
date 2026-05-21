## Tasks

- [x] 1. Включить `code-readability-practices-2026-05-19` в архитектурную governance-орбиту.
- [x] 2. Зафиксировать sequence transformation changes.
- [x] 3. Для каждого transformation change определить цель, зависимости, non-goals и acceptance criteria.
- [x] 4. Объяснить порядок реализации и связь с существующими active changes.
- [x] 5. Добавить strategy change для готовых platform primitives: `producer-platform-component-sourcing-strategy`.
- [x] 6. Зафиксировать guardrails: UX lab, stack safety, единство Project/Task/Workflow/Workbench/Event shapes, sourcing decision для готовых компонентов.
- [x] 7. Уточнить roadmap как status-aware dispatcher: отделить завершённые foundation changes от активной очереди.
- [x] 8. Привязать readability waiver follow-up'ы к отдельной cleanup lane без подмены capability roadmap.
- [x] 9. Проверить `npm run openspec`, `npm run test:traceability`, `git diff --check`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: тестовая часть каждого behavior-change должна быть явной.
- `code-readability`: практики читаемости используются как governance baseline.
- `architecture-roadmap`: новая capability dispatcher'а.
- `component-sourcing`: стратегия выбора готовых компонентов и adapter boundary.
- `code-readability`: readability cleanup фиксируется как отдельная follow-up lane.

Уровень проверки:
- static/contract: обязательный.
- unit/component/e2e: не требуется, dispatcher не меняет runtime.

Команды запуска:
- `npm run openspec`
- `npm run test:traceability`
- `git diff --check`

Mock/fixture-данные и credentials:
- Не нужны.

Если покрытие откладывается:
- Не требуется: dispatcher не добавляет runtime behavior.

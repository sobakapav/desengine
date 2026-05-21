## Task: минимальный контракт (MVP)

Задача — контейнер цели и артефактов.

Предлагаемый MVP:

- `Task`:
  - `id`
  - `title`
  - `type` (один из классов: component-polish, design-system, decompose-vibecode, compose-complex, product-prototype, …)
  - `projectId?`
  - `createdAt/updatedAt`
  - `artifacts[]` (стартовые и производные)
  - `workflowInstanceId?`
  - `status` (draft/in_progress/done/archived)
  - `notes/tags`

- `Artifact`:
  - `id`
  - `type` (design-system, tokens, code, storybook, prompts, references, assets, etc.)
  - `source` (imported/generated/user-provided)
  - `payload` (link/ref + метаданные)

## Workflow: минимальный контракт (MVP)

Workflow — исполняемый/наблюдаемый процесс, который может отличаться между типами задач.

MVP:

- `WorkflowDefinition`:
  - `id`
  - `taskType`
  - `version`
  - `steps[]` (с возможностью расширения)

- `WorkflowStep`:
  - `id`
  - `kind` (например: collect-inputs, generate, refactor, review, test, publish)
  - `inputsSchema?` / `outputsSchema?` (минимально — описательно, позже можно формализовать)
  - `ui` (как представлять шаг пользователю)

- `WorkflowInstance`:
  - `id`
  - `definitionId`
  - `currentStepId`
  - `history[]` (выполненные шаги, результаты, ошибки)

## Принципы

- Workflow должен быть расширяемым: нельзя жёстко зашить шаги только под один тип задач.
- Артефакты — first-class: всё, что важно для результата, должно быть учтено как артефакт.
- Логирование/опыт: шаги workflow должны оставлять след (для обобщения опыта и воспроизводимости).

## План внедрения (эскиз)

1) Ввести доменную модель и storage (локально) без изменения текущего UX.
2) Добавить минимальный workflow для 1–2 типов задач (например: component → storybook).
3) Постепенно наращивать типы задач и шаги, сохраняя traceability и тесты.

## Тестирование

- Unit/contract: сериализация модели, правила переходов, валидность артефактов.
- Traceability: сценарии Task/Workflow связаны с тестами.
- E2E smoke: создать задачу → пройти 1–2 шага → получить артефакт.


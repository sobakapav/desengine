## Context

Обновлённый `producer-project` теперь разделяет первую волну на foundation, onboarding/task layer, workflow layer, затем `workbench` / preview binding и только потом progress invalidation. Это важная декомпозиция: workflow больше нельзя прятать внутри task runtime или внутри `workbench`.

Одновременно нужно соблюдать вводные `producer-architecture-transform`: сущности должны иметь явные boundaries и ownership, а разные слои нельзя склеивать только ради удобства локальной реализации.

## Goals

- Сделать active project обязательным контекстом workflow layer.
- Зафиксировать workflow как отдельный process-layer между task и `workbench`.
- Сохранить архитектурную гибкость и не навязывать модель `один шаг = один верстак`.

## Non-goals

- Не переносить сюда ownership task-layer или workbench-layer.
- Не решать в этой ветке progress invalidation.
- Не создавать новый project shell сверх необходимого workflow binding.

## Decisions

1. Workflow layer оформляется самостоятельным implement change после onboarding/task.

2. `WorkflowStepInstance` и связанные projection модели обязаны нести `projectId` active project context.

3. Change фиксирует project-aware workflow semantics, но не утверждает жёсткого соответствия между workflow step и конкретным верстаком.

## Risks / Trade-offs

- Если workflow оставить внутри task-layer, проектный процесс решения останется неявным.
  -> Mitigation: отдельная implement-ветка с наблюдаемым project-aware workflow contract.

- Если workflow смешать с `workbench`, первый архитектурный срез снова потеряет читаемую границу сущностей.
  -> Mitigation: в этом change фиксировать только process-layer и его project boundary.

## Open Questions

- Какие именно workflow projection surfaces обязаны стать project-aware уже в первой реализации.
- Нужен ли отдельный follow-up для расширенной истории workflow-состояний внутри проекта.

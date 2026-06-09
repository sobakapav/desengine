## Context

Обновлённый `producer-project` теперь точнее делит первую волну: сразу после `ProjectWorkspace` должен идти onboarding/task layer, затем workflow как отдельный процессный слой, и только потом `workbench` / preview semantics.

Это хороший сдвиг: если смешать task layer и workbench binding в одной ветке, мы снова получим слишком широкий change, который сложно проверять и легко перегрузить побочными решениями.

## Goals

- Сделать active project обязательным контекстом для onboarding/task flow.
- Не втягивать в эту ветку workflow или workbench/preview semantics.
- Сохранить проектную волну совместимой с `producer-architecture-transform`, где важные сущности должны проявляться как явные boundaries.

## Non-goals

- Не вводить здесь `WorkflowStepInstance`-контракт и preview semantics как основной объект change.
- Не решать progress invalidation.
- Не создавать новый project shell сверх необходимого task-layer binding.

## Decisions

1. onboarding/task layer отделяется от workflow и workbench/preview binding в самостоятельный change.

2. Этот change отвечает за:
   - task/opening flow внутри active project;
   - project-aware task projection;
   - базовую передачу project context дальше по task runtime.

3. Более глубокая project-scoped семантика workflow и preview выносится в следующие downstream implement changes.

## Risks / Trade-offs

- Если оставить task layer внутри combined change, producer-последовательность размоется.
  -> Mitigation: явное отдельное implementation-сечение для onboarding/task.

- Если task layer описать слишком слабо, foundation project boundary окажется "бумажной".
  -> Mitigation: фиксировать project-aware task contract как наблюдаемое поведение.

## Open Questions

- Какие части task catalog и task list обязаны стать project-aware уже в первой реализации.
- Нужен ли project-aware task selection UI в этой же ветке или достаточно runtime contract.

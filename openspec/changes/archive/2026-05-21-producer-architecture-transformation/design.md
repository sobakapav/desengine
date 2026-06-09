## Context

Текущий lab уже стал центральным runtime. Первые стабилизационные changes сделали его безопаснее: route handlers стали тоньше, появился service boundary, минимальный Project для preview и проверяемая traceability. Часть roadmap из первой архитектурной волны уже реализована и архивирована 2026-05-20, поэтому следующий риск теперь другой: потерять актуальный порядок и смешать завершённые foundation boundaries, активные capability changes и readability cleanup в одну плоскую очередь.

## Roadmap

### Шаг 0. Принятый фундамент

- `code-readability-practices-2026-05-19`: governance baseline для читаемости, review hygiene и будущих checks.
- `implement-lab-runtime-contract-hardening`: service boundary, mutation boundary, canonical route map; change закрыт и архивирован 2026-05-21 через `dispatcher-runtime`.
- `dispatcher-ui-kit`: релизный срез seed `Project` для Sandpack preview и дальнейший диспетчер UI kit-направления.
- `dispatcher-runtime`: tactical owner для lab runtime foundation changes.

### Шаг 1. Завершённые foundation changes

- `implement-project-workspace-storage-boundary` — архивирован 2026-05-20.
- `implement-task-workflow-artifact-contract` — архивирован 2026-05-20.
- `implement-workbench-platform-registry` — архивирован 2026-05-20.
- `implement-prompt-context-runtime-boundary` — архивирован 2026-05-20.

Эти шаги больше не являются следующими кандидатами к исполнению, но остаются обязательным фундаментом для downstream changes и cleanup-рефакторинга.

### Шаг 2. Component Sourcing Strategy

Change: `producer-platform-component-sourcing-strategy`.

Почему следующим: foundation уже закрепил `Project`, `Task/Workflow/Artifact`, `Workbench` и `PromptContext`, но дальнейшие Workbench tools и runtime primitives всё ещё могут разойтись по стеку зависимостей. Перед следующей волной UI/runtime расширений нужно зафиксировать политику `reuse / adapt / build`.

### Шаг 3. Event Envelope для Experience / Cost / Action Log

Change: `producer-event-envelope-experience-cost-boundary`.

Почему после project/task/workflow: события должны быть scoping-first и privacy-first. Experience, action log и cost нельзя внедрять как три независимых журнала.

### Шаг 4. Packaging Readiness через Storage Adapters

Change: `dispatcher-packaging-readiness-storage-adapters`.

Почему последним в первой волне: cloud/electron packaging не должен цементировать storage раньше Project/Task/Artifact/Event boundaries.

### Шаг 5. Follow-up cleanup lane

Эта lane не меняет продуктовую последовательность capability changes и не подменяет активную очередь. Она нужна, чтобы закрывать временные readability waiver'ы после стабилизации соответствующих архитектурных границ.

- `architecture-followup-route-services`: route handler для Sandpack всё ещё держит parsing и payload glue; его декомпозиция должна идти отдельным route-service refactor без изменения HTTP-контракта.
- `architecture-followup-workbench-controller-split`: после завершения Project Workspace boundary и Workbench Registry можно выделять project/workbench orchestration hooks без UI-регрессии.
- `architecture-followup-sandpack-facade-split`: preview boundary уже стабилизирован, и теперь можно разнести legacy fallback, ProjectWorkspace settings и payload builders по отдельным фасадам.

## Dependency Graph

```text
code-readability-practices
lab-runtime-contract-hardening
dispatcher-ui-kit
  -> project-workspace-storage-boundary [done]
    -> task-workflow-artifact-contract [done]
      -> workbench-platform-registry [done]
      -> prompt-context-runtime-boundary [done]
      -> platform-component-sourcing-strategy [active]
      -> event-envelope-experience-cost-boundary [planned]
    -> packaging-readiness-storage-adapters [planned]
  -> architecture-followup-route-services [cleanup]
  -> architecture-followup-workbench-controller-split [cleanup]
  -> architecture-followup-sandpack-facade-split [cleanup]
```

## Deferred Product Directions

- `producer-dev-mode-project-work` реализуется через Project Workspace boundary, а не параллельным Project shape.
- `producer-task-and-workflow-entities` становится входом для Task/Workflow/Artifact contract.
- `producer-platform-component-sourcing-strategy` становится продюсерским контуром, который задаёт общий вектор на использование готовых React-primitives без поштучного ведения уже внедрённых модулей.
- `dispatcher-workbench-entity-workflow-step`, `producer-image-inspector`, `dispatcher-workbench-layout-space` идут после Workbench Platform Registry.
- `dispatcher-tasks` и `idea-prompt-builder` идут после Prompt Context Runtime Boundary.
- `user-experience-generalization`, `user-action-logging`, `cost-accounting-layer` идут через общий Event Envelope.
- `figma-project-import-adapter`, `project-roadmap-entity`, packaging changes ждут Project/Artifact/Storage readiness.
- Readability follow-up refactor'ы идут после соответствующих foundation steps и не объявляются заменой capability roadmap.

## Guardrails

- UX lab не трогаем капитально.
- Не меняем install-critical стек без отдельного решения.
- Не создаём второй `Project`, `Task`, `Workflow`, `Workbench`, `Artifact`, `Event` shape.
- Для новых platform primitives сначала фиксируем sourcing decision: `reuse`, `adapt` или `build`.
- Roadmap в producer всегда показывает статус шага: `done`, `active`, `planned` или `cleanup`.
- Каждый behavior-change обновляет OpenSpec specs и тестовую часть.
- Если покрытие откладывается, добавляется запись в `test/traceability/coverage-plan.json`.

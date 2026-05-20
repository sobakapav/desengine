## Context

Текущий lab уже стал центральным runtime. Первые стабилизационные changes сделали его безопаснее: route handlers стали тоньше, появился service boundary, минимальный Project для preview и проверяемая traceability. Следующий риск — начать новые продуктовые фичи раньше, чем появятся Project Workspace, Artifact, Workflow, Workbench и Event/Storage boundaries.

## Roadmap

### Шаг 0. Принятый фундамент

- `code-readability-practices-2026-05-19`: governance baseline для читаемости, review hygiene и будущих checks.
- `implement-lab-runtime-contract-hardening`: service boundary, mutation boundary, canonical route map.
- `dispatcher-project-ui-kit-switching`: seed `Project` для Sandpack preview.

### Шаг 1. Project Workspace + Storage Boundary

Change: `implement-project-workspace-storage-boundary`.

Почему первым: `Project` уже появился в lab-preview, но пока хранится локально в Workbench. Если не поднять его в workspace/storage boundary, dev-mode, import, roadmap, cost и packaging начнут создавать разные project shapes.

### Шаг 2. Task / Workflow / Artifact Contract

Change: `implement-task-workflow-artifact-contract`.

Почему вторым: после project scope нужно определить, что именно живёт внутри проекта: task instances, workflow instances, artifacts и связи между ними. Без этого Workbench станет владельцем всего состояния.

### Шаг 3. Component Sourcing Strategy

Change: `dispatcher-platform-component-sourcing-strategy`.

Почему перед Workbench Registry: Workbench tools будут опираться на готовые primitives вроде Sandpack, Konva, Monaco, shadcn/Radix, Mermaid, Storybook/Vitest/Playwright. До проектирования registry нужно зафиксировать политику `reuse / adapt / build`, чтобы не переписывать зрелые компоненты вручную и не тащить зависимости без ownership boundary.

### Шаг 4. Workbench Platform Registry

Change: `implement-workbench-platform-registry`.

Почему после component sourcing: Workbench должен стать instance/profile, привязанный к task/workflow/artifacts, а его tools должны выбирать готовые или собственные primitives через sourcing decision. Это разблокирует image tools и layout workbench без размножения локальных registry.

### Шаг 5. Prompt Context Runtime Boundary

Change: `implement-prompt-context-runtime-boundary`.

Почему после Workbench: prompt context должен включать project, task, workflow step, artifacts и tool state. До появления этих границ prompt builder и task hints рискуют разойтись по моделям контекста.

### Шаг 6. Event Envelope для Experience / Cost / Action Log

Change: `idea-event-envelope-experience-cost-boundary`.

Почему после project/task/workflow: события должны быть scoping-first и privacy-first. Experience, action log и cost нельзя внедрять как три независимых журнала.

### Шаг 7. Packaging Readiness через Storage Adapters

Change: `dispatcher-packaging-readiness-storage-adapters`.

Почему последним в первой волне: cloud/electron packaging не должен цементировать storage раньше Project/Task/Artifact/Event boundaries.

## Dependency Graph

```text
code-readability-practices
lab-runtime-contract-hardening
project-ui-kit-switching
  -> project-workspace-storage-boundary
    -> task-workflow-artifact-contract
      -> platform-component-sourcing-strategy
        -> workbench-platform-registry
        -> prompt-context-runtime-boundary
      -> event-envelope-experience-cost-boundary
    -> packaging-readiness-storage-adapters
```

## Deferred Product Directions

- `research-dev-mode-project-work` реализуется через Project Workspace boundary, а не параллельным Project shape.
- `research-task-and-workflow-entities-research` становится входом для Task/Workflow/Artifact contract.
- `dispatcher-platform-component-sourcing-strategy` становится обязательным фильтром перед новыми Workbench tools, чтобы по максимуму использовать готовые компоненты без зависимости ради зависимости.
- `dispatcher-workbench-entity-workflow-step`, `research-lab-image-inspector-tools-plan`, `dispatcher-workbench-layout-space` идут после Workbench Platform Registry.
- `dispatcher-task-hints-templating` и `idea-prompt-builder` идут после Prompt Context Runtime Boundary.
- `user-experience-generalization`, `user-action-logging`, `cost-accounting-layer` идут через общий Event Envelope.
- `figma-project-import-adapter`, `project-roadmap-entity`, packaging changes ждут Project/Artifact/Storage readiness.

## Guardrails

- UX lab не трогаем капитально.
- Не меняем install-critical стек без отдельного решения.
- Не создаём второй `Project`, `Task`, `Workflow`, `Workbench`, `Artifact`, `Event` shape.
- Для новых platform primitives сначала фиксируем sourcing decision: `reuse`, `adapt` или `build`.
- Каждый behavior-change обновляет OpenSpec specs и тестовую часть.
- Если покрытие откладывается, добавляется запись в `test/traceability/coverage-plan.json`.

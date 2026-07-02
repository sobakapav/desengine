# ADR-0002: Базовая карта сущностей и слоёв

- Статус: `accepted`
- Дата: `2026-06-10`
- Tactical owner: `dispatcher-architecture`

## Контекст

Producer и dispatcher уже зафиксировали несколько важных архитектурных тезисов:

- project workspace является основной продуктовой поверхностью;
- важные сущности должны иметь явное место в коде;
- `Project`, `ProjectComponent`, `Workflow` и `Artifact` не должны оформляться как параллельные и несовместимые модели;
- сквозные сущности `код`, `LLM`, `бюджет` и `дизайн` нельзя терять в случайном именовании.

До этого change эти правила были размазаны по roadmap, design и архивным материалам. Для downstream implementation wave этого недостаточно.

## Решение

Действующим baseline для architecture-facing changes считается следующая картина:

1. Слои:
   - `Product Shell`
   - `Project Workspace`
   - `Workflow Surface`
   - `Prompt / LLM`
   - `Storage Boundary`
   - `Quality / Governance`

2. Ключевые сущности:
   - `Project`
   - `ProjectComponent`
   - `WorkflowInstance`
   - `WorkflowStep`
   - `Artifact`
   - `PromptContext`
   - `ApplicationService`
   - `StorageAdapter`
   - `EventEnvelope`

3. Сквозные сущности:
   - `код`
   - `LLM`
   - `бюджет`
   - `дизайн`

4. Явные исключения baseline:
   - `AI-трансформация` остаётся стратегической рамкой, а не operational-модулем;
   - `сессия работы` пока не выделяется в самостоятельный слой;
   - `WorkflowStep` не должен подменяться legacy-уровнем или экраном;
   - `документация`, `Figma` и `качество` не поднимаются до отдельного списка сквозных сущностей этой карты.

## Последствия

Положительные:

- downstream changes получают общий словарь для entity naming и handoff;
- можно проверять, не появилась ли новая анонимная сущность без governance-следа;
- легче разделять architecture-line changes и предметные implementation changes.

Ограничения:

- baseline не заменяет низкоуровневые boundary contracts;
- появление новых слоёв или сквозных сущностей требует отдельного producer/dispatcher решения.

## Связанные материалы

- `openspec/changes/focus-tech/roadmaps/architecture-transformation.md`
- `openspec/changes/producer-architecture-transform/roadmaps/architecture-implementation.md`
- `openspec/changes/archive/2026-05-20-architecture-capital-analysis-2026-05-19/artifacts/as-is-map.md`
- `openspec/changes/archive/2026-05-20-architecture-capital-analysis-2026-05-19/artifacts/target-architecture.md`
- `docs/architecture/map.md`
- `docs/architecture/glossary.md`

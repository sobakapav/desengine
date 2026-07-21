## Миссия

- Что должен изменить этот change: Убрать конечный каталог свободных workflow-слотов для компонентов проекта. Компонент должен открывать типовой workflow template напрямую, а не искать отдельный уникальный runtime slot. Ситуация "нет доступных слотов" должна исчезнуть.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: project page уже является точкой входа в цепочку `проект -> компонент -> workflow`, а dispatcher-project удерживает её как текущий tactical приоритет.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию удерживает `producer-project` в domain-линии, тактику и приёмку downstream результата удерживает `dispatcher-project`.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-project-component-workflow-template-binding: `openspec/specs/projects/spec.md`, `openspec/specs/workflow/spec.md`, `components/desengine/project/ProjectComponentsPanel.tsx`, `components/desengine/project/projectComponentWorkflow.ts`, `lib/project/workflow-readout.ts`.

## Границы исполнения

- Что входит в этот change: убрать дефицит свободных workflow-слотов для компонентов проекта, перевести component flow на типовой workflow template и сохранить раздельные runtime-сессии компонентов.
- Что сознательно не входит в этот change: новый каталог workflow, переработка onboarding-контента, новый отдельный экран для component runtime-инстансов, изменение install-critical инфраструктуры.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: приоритет project chain, разделение project/workflow/workbench слоёв и общий project-facing контур уже заданы родительской линией.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: компонент получает workflow template без поиска свободного слота; project-facing surfaces читают component-scoped context; runtime может хранить несколько project scopes для одного template workflow.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: как сохранить уникальность runtime-данных при общем template workflow и как не сломать project-facing readout/history surfaces.

## Миссия

- Что должен изменить этот change: Проявить Workbench как новую рабочую поверхность в runtime/UI: сделать явной связку project -> task -> workflow step -> workbench, ослабить lab-centric терминологию и показать WorkbenchDefinition/Instance не только во foundation, но и в пользовательском surface.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: producer-workbench
- strategy_root: producer-workbench
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-workbench
- Что из родительского change уже решено: Workbench закреплён как целевая главная рабочая поверхность продукта; downstream changes должны проявлять связку `project -> task -> workflow -> workbench`, а не оставлять Workbench внутренней foundation-структурой при lab-centric пользовательской модели.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию и смысл линии держит `producer-workbench`, этот implement реализует конкретный product-facing срез, внешний verification и приёмку выполняет родительский агент.

## Обязательные источники

- openspec/changes/producer-workbench/proposal.md
- openspec/changes/producer-workbench/design.md
- openspec/changes/producer-workbench/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workbench-task-workflow-surface:
  - openspec/specs/workbench/spec.md
  - openspec/specs/workflow/spec.md
  - lib/workbench/model.ts
  - lib/workbench/lab-profile.ts
  - lib/task/projection.ts
  - components/desengine/lab/Workbench/WorkbenchHeader.tsx
  - components/desengine/lab/Workbench/WorkbenchContent.tsx
  - components/desengine/lab/Workbench/props.ts
  - openspec/changes/release-2026-06-10-architecture/release-notes.md

## Границы исполнения

- Что входит в этот change:
  - показать в runtime/UI явную связку `project -> task -> workflow step -> workbench`;
  - вывести `WorkbenchDefinition/Instance` из чисто foundation-слоя в пользовательский surface;
  - ослабить lab-centric терминологию там, где Workbench уже должен читаться как новая рабочая поверхность;
  - при необходимости обновить OpenSpec contract для user-facing surface этого шага.
- Что сознательно не входит в этот change:
  - полноценная workflow-навигация между несколькими шагами;
  - полный демонтаж `level-labs` маршрутов;
  - новый набор tool families beyond current lab workbench;
  - крупный UI redesign всего Workbench.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - Workbench является главной рабочей поверхностью, а не частным lab-экраном;
  - `level-labs` считаются legacy-моделью, но их controlled transition должен идти через Workbench, а не через пустой rename;
  - change должен оставаться минимальным surface-step, а не превращаться в полный workflow-engine redesign.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/workbench-platform-registry.test.ts test/unit/task-workflow-artifact-projection.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/p1-source-contracts.test.ts
- Что именно должен доказать результат проверки: Workbench surface действительно проявляет definition/instance и workflow-step связь в пользовательском контуре, не ломая foundation registry/projection и не размывая project-aware runtime semantics.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какой минимальный user-facing surface достаточно проявляет Workbench без ухода в косметический rename;
  - какие source/unit-контракты нужно обновить, чтобы traceability не осталась на старой lab-centric формулировке;
  - где проходит безопасная граница между surface-step и полноценной workflow-навигацией.

## Что реализовано

- Добавлен derived surface-слой `components/desengine/lab/Workbench/workbenchSurface.ts`:
  - surface строится из уже существующих `project + task + workflow projection + workbench registry`;
  - `WorkbenchDefinition` и `WorkbenchInstance` больше не остаются только foundation-структурами.
- Добавлен user-facing блок `components/desengine/lab/Workbench/WorkbenchSurfaceSummary.tsx`:
  - в header теперь явно видна связка `project -> task -> workflow step -> workbench`;
  - surface показывает `WorkbenchDefinition.title`, `definitionId`, `profileId`, `WorkbenchInstance.id` и текущий workflow step.
- `WorkbenchHeader.tsx` ослабляет lab-centric модель:
  - верхний лейбл теперь `Рабочая поверхность`;
  - заголовок текущего шага читается как `Шаг workflow: уровень N`.
- `WorkbenchContent.tsx` тоже ослабляет lab-centric термины:
  - `Контекст рабочей поверхности`
  - `Рабочие файлы поверхности`
- `lib/workbench/lab-profile.ts` обновляет user-facing title definition:
  - было: `Лаборатория компонента`
  - стало: `Рабочая поверхность компонента`

## Active spec

- Обновлены active specs:
  - `openspec/specs/workbench/spec.md`
  - `openspec/specs/workflow/spec.md`
- Изменение точечное: добавлены user-facing сценарии, где runtime surface показывает definition/instance и текущий workflow step через Workbench.

## Что важно проверить внешне

- Это не пустой rename:
  - surface реально строится из `buildTaskWorkflowArtifactProjection` и `labWorkbenchRegistry`;
  - пользовательский контур теперь читает foundation-сущности Workbench, а не только lab UI controls.
- Это не полноценная workflow-навигация:
  - change показывает текущий workflow step и primary workbench;
  - но не добавляет переходы между несколькими шагами.

## Локальная проверка исполнителя

- Выполнена sanity-команда из metadata:
  - `npm run test:unit -- test/unit/workbench-platform-registry.test.ts test/unit/task-workflow-artifact-projection.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/p1-source-contracts.test.ts`
- Результат:
  - `4` test files passed
  - `37` tests passed

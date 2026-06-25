## Миссия

- Что должен изменить этот change: Перевести пользовательскую workbench-поверхность из языка уровней в язык одного workflow с пунктами, промежуточными артефактами и общим рендер-центром.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - Workbench считается главной рабочей поверхностью продукта;
  - `level-labs` не являются долгосрочной целевой моделью;
  - workflow должен materialize через Workbench, а не через изолированный rename;
  - image/preview/layout направления живут внутри общей workbench-линии.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегию и backlog-линии задаёт parent owner `dispatcher-workbench` вместе с producer-контекстом;
  - этот implement change отвечает только за конкретный пользовательский surface-срез;
  - внешняя приёмка выполняется parent agent или пользователем.

## Обязательные источники

- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/changes/dispatcher-workbench/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workbench-workflow-session-surface:
  - openspec/changes/implement-workflow-image-component-foundation/design.md
  - openspec/changes/implement-workflow-image-component-foundation/specs/workflow/spec.md
  - openspec/changes/implement-workflow-image-component-foundation/specs/workbench/spec.md
  - components/desengine/lab/Workbench/WorkbenchHeader.tsx
  - components/desengine/lab/Workbench/WorkbenchContent.tsx
  - components/desengine/lab/Workbench/WorkbenchSurfaceSummary.tsx
  - components/desengine/lab/Workbench/workbenchSurface.ts
  - components/desengine/lab/Workbench/WorkbenchView.tsx
  - test/unit/p1-source-contracts.test.ts
  - test/unit/workbench-platform-registry.test.ts

## Границы исполнения

- Что входит в этот change:
  - новый workflow-session surface model для Workbench;
  - workflow-point catalog в пользовательском UI;
  - preview как render-center workflow;
  - замена основных level-oriented подписей и объяснений внутри Workbench.
- Что сознательно не входит в этот change:
  - новые server/runtime mutations;
  - отдельная навигация по point-ам workflow;
  - отказ от legacy level storage;
  - переписывание task page, level page и общесистемных task contract экранов.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - Workbench остаётся целевой рабочей поверхностью;
  - controlled transition away from `level-labs` идёт через Workbench;
  - workflow foundation уже принят как каноническая модель исполнения;
  - проектный контекст не переоткрывается и остаётся базовой рамкой runtime.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - Workbench UI больше не описывает текущую работу как `уровень` в основных workflow-заголовках;
  - surface показывает coordinator step `Работаем над workflow`;
  - surface показывает workflow points и render-center;
  - source-contract тесты синхронизированы с новой пользовательской моделью.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какой минимальный состав данных нужен в `WorkbenchSurfaceSnapshot` для workflow UI;
  - какие старые тексты нужно заменить уже сейчас, а какие можно оставить внутри compatibility API;
  - как показать workflow points так, чтобы не ввести ложную навигацию или несуществующие мутации.

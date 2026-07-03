## Миссия

- Что должен изменить этот change: Ввести канонический workflow типа создания React-компонента по картинке: пункты workflow вместо уровней, общий iteration loop и legacy-bridge для текущих runtime/level данных.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow должен заменить уровни как модель исполнения, а не просто скрыть их;
  - пользовательская работа типа «сделать компонент по картинке» рассматривается как единый workflow;
  - результат workflow — это набор артефактов компонента, а не один файл;
  - шаги workflow могут быть параллельными по смыслу и по генерации артефактов;
  - Storybook-файл является одной из ключевых частей результата.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегию и приоритет линии задаёт parent owner `dispatcher-workflow` / вышестоящий producer workflow;
  - этот implement change отвечает за узкую кодовую реализацию foundation-слоя;
  - внешняя приёмка результата выполняется parent agent или пользователем.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workflow-image-component-foundation:
  - openspec/specs/workflow/spec.md
  - openspec/specs/level-labs/spec.md
  - lib/project/workflow-readout.ts
  - components/desengine/lab/Workbench/workbenchSurface.ts
  - lib/workbench/lab-profile.ts
  - test/unit/workflow-image-component-foundation.test.ts
  - test/unit/workbench-platform-registry.test.ts
  - test/unit/project-workflow-readout-surface.test.ts

## Границы исполнения

- Что входит в этот change:
  - каноническая workflow-проекция для image-to-component workflow;
  - coordinator step `Работаем над workflow`;
  - catalog of workflow points для базового набора артефактов;
  - legacy-bridge от текущего level progress к point statuses;
  - обновление source-contract/unit тестов и связанных labels.
- Что сознательно не входит в этот change:
  - новый storage format;
  - полный отказ от legacy level runtime;
  - отдельный mutation API для point-ов workflow;
  - сложная dependency graph model между point-ами;
  - полный пользовательский слой редактирования workflow.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow является целевой моделью исполнения;
  - producer отвечает за всю линию изменений целиком;
  - workbench остаётся рабочей поверхностью исполнения;
  - проектный контекст уже считается базовой границей runtime.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - runtime projection больше не сводит workflow к одному `level-lab` шагу;
  - current runtime связывается с coordinator step `Работаем над workflow`;
  - workflow points отражают базовый набор артефактов компонента;
  - workbench/readout/prompt-adjacent contracts не расходятся с новой моделью;
  - переход выполнен без требования live credentials и без миграции storage.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какие machine-readable ids и labels использовать для workflow points;
  - как именно мапить legacy-level progress на point statuses без миграции storage;
  - какие существующие source-contract тесты требуют синхронизации;
  - достаточно ли foundation-уровня для следующего шага реализации пользовательского workflow UI.

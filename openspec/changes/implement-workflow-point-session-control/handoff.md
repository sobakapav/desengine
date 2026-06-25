## Миссия

- Что должен изменить этот change: Сделать workflow-пункты управляемыми в Workbench: выбор пункта должен переводить сессию на связанные артефакты и файлы, чтобы workflow работал как производственный шаг, а не только как read-only список.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow считается целевой моделью исполнения;
  - coordinator step `Работаем над workflow` уже принят как главный runtime-step;
  - catalog of workflow points уже проявлен в projection и Workbench surface;
  - Workbench остаётся рабочей поверхностью workflow.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегию линии задаёт `dispatcher-workflow` и вышестоящий producer workflow;
  - этот implement change отвечает только за конкретный управляемый point-control слой;
  - внешняя приёмка выполняется parent agent или пользователем.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workflow-point-session-control:
  - openspec/changes/implement-workflow-image-component-foundation/design.md
  - openspec/changes/implement-workbench-workflow-session-surface/design.md
  - components/desengine/lab/Workbench/workbenchSurface.ts
  - components/desengine/lab/Workbench/WorkbenchSurfaceSummary.tsx
  - components/desengine/lab/Workbench/useWorkbenchController.ts
  - components/desengine/lab/Code/Code.tsx
  - components/desengine/lab/LabScreen/screen-event.ts
  - test/unit/workbench-workflow-session-surface.test.ts

## Границы исполнения

- Что входит в этот change:
  - surface metadata для workflow-point selection;
  - UI-control выбора point-а;
  - переключение editor focus на связанный file;
  - selected-point feedback в Workbench surface.
- Что сознательно не входит в этот change:
  - новый route layer;
  - отдельный orchestrator workflow-point actions;
  - server-side state для point selection;
  - новые prompt/check contracts по каждому point-у.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow foundation и workflow-session surface уже заданы предыдущими implement changes;
  - project-aware runtime остаётся базовым контрактом;
  - Workbench не разламывается на отдельные параллельные сущности.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - workflow-point можно выбрать как production focus;
  - surface знает related files и primary file target;
  - выбор point-а переводит Workbench на связанный файл без выдуманного server flow;
  - source-contract слой синхронизирован с новой моделью.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - как определить selected point из текущего active file;
  - что делать с point-ами, у которых файл ещё не доступен в текущем runtime;
  - как реализовать переключение, не ломая существующую file-save semantics.

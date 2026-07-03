## Миссия

- Что должен изменить этот change: превратить ключевые архитектурные модули проекта в пользовательски ценные контракты через manifest, API, artifacts, workflow templates и prompt brief.
- Этот change меняет код только на уровне implement/fix и не переоткрывает решения `dispatcher-project` как тактической линии.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: producer-project
- Что из родительского change уже решено:
  - `Project` считается верхним контекстом пользовательской работы;
  - project page является главной рабочей поверхностью;
  - workflow принадлежит проекту, а не отдельному legacy runtime-слою.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия: `producer-project` и связанные producer-level product decisions;
  - тактика: `dispatcher-project`;
  - приёмка результата: parent owner через traceability и внешнюю verification-проверку.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- openspec/specs/projects/spec.md
- openspec/specs/workflow/spec.md
- openspec/specs/artifacts/spec.md
- openspec/specs/prompt-context/spec.md
- openspec/specs/storage-adapter/spec.md
- docs/architecture/map.md
- docs/architecture/glossary.md
- components/desengine/project/ProjectOverviewScreen.tsx
- components/desengine/project/ProjectConfigPanel.tsx
- lib/project/runtime.ts
- lib/project/storage.ts
- lib/project/workflow-readout.ts
- lib/project/history-diagnostics.ts
- lib/prompt/render/server.ts

## Границы исполнения

- Что входит в этот change:
  - OpenSpec delta specs для product-facing капитализации архитектурных модулей;
  - project manifest contract и первая browser-local import/export реализация;
  - project API foundation;
  - первые project-facing surfaces для manifest, artifacts, workflow template и prompt brief.
- Что сознательно не входит в этот change:
  - cloud sync;
  - multi-user collaboration;
  - полный Git/Figma integration layer;
  - новая install-critical инфраструктура.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - `Project` как главный scope;
  - отказ от legacy pre-project paths;
  - workflow ownership у проекта.

## Проверка результата

- verification_level: unit + traceability
- verification_command: npm run test:unit -- test/unit/project-user-surface-foundation.test.ts test/unit/project-workflow-readout-surface.test.ts test/unit/project-history-diagnostics-surface.test.ts && npm run test:traceability
- Что именно должен доказать результат проверки:
  - новые capability/scenario зафиксированы в OpenSpec;
  - project page и API/source contracts знают о manifest/product-facing слоях;
  - import/export и новые surfaces не ломают текущий project-first путь.

## Открытые вопросы

- Какая часть artifact library в первой волне может быть metadata-driven, а какая обязана быть file-backed сразу.
- Нужен ли prompt brief уже на project level, или часть редактируемости должна быть component-scoped.
- Достаточно ли в первой волне read/write manifest API, или нужен также route для artifacts readout.

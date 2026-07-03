## Миссия

- Что должен изменить этот change: оформить producer-контур внедрения сущности `Project` как нового domain context и явно делегировать первым downstream behavior-change отдельный `implement`-срез для `project entity and storage boundary`, где базовый `UI kit` является обязательной частью проекта и глобальным контрактом для downstream сущностей.
- Этот change не меняет код напрямую и не подменяет собой downstream dispatcher/implement ветки.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-domain` уже является верхним контекстом управления сущностями предметной области внутри продукта; ранняя идея project mode уже зафиксировала продуктовую гипотезу MVP-first без roadmap в первой волне.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию доменных сущностей держит `focus-domain`, актуальный product intent по project mode удерживает `producer-project`, при этом архивированная idea-линия остаётся историческим источником, тактику первой delivery-волны и состав downstream работ держит `producer-project`, приёмка идёт через traceability и последующую постановку downstream changes.

## Обязательные источники

- openspec/changes/focus-domain/proposal.md
- openspec/changes/archive/2026-06-09-idea-project-mode/proposal.md
- openspec/changes/archive/2026-06-09-idea-project-mode/design.md
- openspec/changes/producer-ui-kit/proposal.md
- openspec/specs/projects/spec.md
- openspec/specs/workflow/spec.md
- openspec/specs/workbench/spec.md
- openspec/specs/level-labs/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для producer-project: active changes и спецификации, связанные с `projects`, `workflow`, `workbench`, `level-labs`, а также downstream изменения по project-scoped runtime и storage boundary из архива.

## Границы исполнения

- Что входит в этот change: рамка внедрения сущности `Project`, обязательный базовый `UI kit`, правило тяжёлой `UI kit` migration, делегирование первого downstream foundation-change для `ProjectWorkspace` и active project boundary, порядок постепенной project-scoped привязки существующих сущностей, карта downstream delivery-вопросов.
- Что сознательно не входит в этот change: прямой код MVP, `Project Roadmap`, окончательная user/project scope-модель для всех доменов, немедленная project-level миграция `LLM`, `Figma`, `Git/GitHub`.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-domain` уже владеет topology доменных сущностей; архивированная idea-линия project mode уже зафиксировала MVP-first логику и запрет на включение roadmap в первую волну.

## Делегированный ближайший шаг

- Первым downstream behavior-change должен стать отдельный `implement`-change для `project entity and storage boundary`.
- Этот change обязан:
  - ввести каноническую сущность `ProjectWorkspace`;
  - определить boundary выбора active project;
  - поднять `project.settings.uiKitId` и `project.settings.uiMode` как единый источник project preview contract;
  - дать runtime и preview читать project contract без ad-hoc shapes.
- Этот change не должен:
  - одновременно делать полную project-scoped миграцию legacy runtime/state;
  - одновременно забирать workflow ownership;
  - одновременно решать progress invalidation при смене `UI kit`;
  - включать project-level `LLM`, `Figma` или `Git/GitHub`.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: новый producer корректно встроен в active OpenSpec topology под `focus-domain`, удерживает внедрение сущности `Project` без roadmap-слоя и явно делегирует первым downstream шагом `project entity and storage boundary`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какой минимальный UX нужен первой волне; как именно после foundation-слоя разделить component entrypoint, workflow binding, workbench binding и progress invalidation; когда project-level `LLM`, `Figma` и `Git/GitHub` становятся продуктово оправданными.

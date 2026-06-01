## Миссия

- Что должен изменить этот change: оформить producer-контур первой delivery-волны `Project` как нового domain context, где базовый `UI kit` является обязательной частью проекта и глобальным контрактом для downstream сущностей.
- Этот change не меняет код напрямую и не подменяет собой downstream dispatcher/implement ветки.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-domain` уже является верхним контекстом управления сущностями предметной области внутри продукта; `idea-project-mode` уже зафиксировал продуктовую гипотезу MVP-first без roadmap в первой волне.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию доменных сущностей держит `focus-domain`, product intent по project mode задаёт `idea-project-mode`, тактику первой delivery-волны и состав downstream работ держит `producer-project-mvp`, приёмка идёт через traceability и последующую постановку downstream changes.

## Обязательные источники

- openspec/changes/focus-domain/proposal.md
- openspec/changes/idea-project-mode/proposal.md
- openspec/changes/idea-project-mode/design.md
- openspec/changes/producer-ui-kit/proposal.md
- openspec/specs/projects/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для producer-project-mvp: active changes и спецификации, связанные с `task`, `workbench`, `level-labs`, `workflow`, а также downstream изменения по project-scoped runtime и storage boundary из архива.

## Границы исполнения

- Что входит в этот change: MVP-рамка сущности `Project`, обязательный базовый `UI kit`, правило тяжёлой `UI kit` migration, порядок постепенной project-scoped привязки существующих сущностей, карта downstream delivery-вопросов.
- Что сознательно не входит в этот change: прямой код MVP, `Project Roadmap`, окончательная user/project scope-модель для всех доменов, немедленная project-level миграция `LLM`, `Figma`, `Git/GitHub`.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-domain` уже владеет topology доменных сущностей; `idea-project-mode` уже зафиксировал MVP-first логику и запрет на включение roadmap в первую волну.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: новый producer корректно встроен в active OpenSpec topology под `focus-domain`, удерживает MVP project mode без roadmap-слоя и даёт осмысленную рамку для downstream implementation changes.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какой downstream change первым вводит project entity; как разнести project entity, task/workbench binding и progress invalidation; какой минимальный UX нужен первой волне; когда project-level `LLM`, `Figma` и `Git/GitHub` становятся продуктово оправданными.

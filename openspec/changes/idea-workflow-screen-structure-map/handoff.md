## Миссия

- Что должен изменить этот change: зафиксировать отдельный workflow создания структуры страниц и экранов как визуально обсуждаемой и кодово представимой карты системы.
- Этот change не меняет код напрямую и не подменяет будущие producer/dispatcher/implement ветки.

## Унаследованный контекст

- parent_change: focus-product
- strategy_root: focus-product
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-product` уже удерживает product-идеи, которые могут стать отдельными workflow-линиями после уточнения ценности и границ.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-product`, а тактические и исполнительские ветки появятся позже при подтверждении самостоятельной ценности этого workflow.

## Обязательные источники

- openspec/changes/focus-product/proposal.md
- openspec/changes/idea-workflow-screen-composition/proposal.md
- openspec/changes/idea-figma-project-import-adapter/proposal.md
- openspec/specs/projects/spec.md
- openspec/specs/workflow/spec.md
- openspec/specs/workbench/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для idea-workflow-screen-structure-map: active changes и спецификации, связанные со screen structure, navigation contour и handoff артефактами.

## Границы исполнения

- Что входит в этот change: самостоятельный workflow карты экранов и страниц, двойная природа результата, границы с import adapter и wireframe-композицией, подготовка future delivery-рамки.
- Что сознательно не входит в этот change: реализация runtime-хранилища карты, wireframe конкретных экранов, перевод компонентов в React, массовый импорт внешнего проекта.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-product` уже задаёт верхний продуктовый контур, а `idea-workflow-screen-composition` уже удерживает следующий уровень детализации для экранного пространства.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: новый idea-change корректно встроен в active OpenSpec topology, удерживает screen structure map как отдельный workflow и не смешивает его с import adapter или wireframe-композицией.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какая минимальная кодовая форма карты нужна первой волне; как лучше отделить page map от screen map; когда workflow должен перейти в producer/dispatcher-контур.

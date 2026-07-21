## Миссия

- Что должен изменить этот change: Добавить project metadata and sources foundation: обязательные поля title/code/uiKit, file-based archive аналитики и ТЗ, project-level Figma files, component graph и screen graph как подвид component graph
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-project` уже закрепил проект как главную рабочую единицу, disk-backed storage как canonical backend, project config с `title/id/uiKitId`, component/workflow path, manifest/artifact/brief surfaces и правило, что project-line развивается поэтапно без смешения всех интеграций в одну волну.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию линии удерживает `focus-domain` вместе с producer/project рамкой; тактическую постановку и приёмку downstream результата удерживает `dispatcher-project`; финальную verification-проверку выполняет внешний проверяющий агент или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-metadata-and-sources-foundation-title-code-uikit: `openspec/specs/projects/spec.md`, `openspec/specs/artifacts/spec.md`, `openspec/specs/project-manifest/spec.md`, `openspec/specs/storage-adapter/spec.md`, `openspec/changes/producer-project/design.md`, `openspec/changes/producer-project/tasks.md`, `openspec/changes/producer-project/roadmaps/project-producer.md`, `openspec/changes/implement-project-manifest-workflow-artifacts-prompt-context-api/design.md`, `openspec/changes/idea-figma-project-import-adapter/proposal.md`.

## Границы исполнения

- Что входит в этот change: metadata contract проекта с `title/code/uiKitId`; project-owned registry `Figma files`; canonical `componentGraph`; canonical `screenGraph` как особый structural slice; file-based archive аналитики и ТЗ; disk-backed layout для этих данных; OpenSpec/spec/test contract для новой модели; минимальная готовность manifest и project surface к чтению этой модели.
- Что сознательно не входит в этот change: полноценный Figma import/sync; visual graph editor; knowledge/wiki system; document versioning; collaborative editing; Git/GitHub integration; полный roadmap проекта; новая install-critical инфраструктура.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: `Project` остаётся верхним пользовательским контекстом; workflow остаётся отдельным process-layer; workbench остаётся downstream shell; project storage остаётся disk-backed и file-based; `Figma` как тяжёлая integration-wave не реализуется целиком в этой поставке.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: у проекта появляется canonical contract для metadata/sources/archive; `code` перестаёт быть неявной ролью `id`; project storage умеет держать Figma refs, structure graphs и document archive в читаемых файлах; project-facing и manifest contracts не конфликтуют с этой моделью.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где проходит минимальная граница между `id` и `code`; как именно назвать и разложить file-based archive, чтобы не запереть будущие типы документов; какой минимальный schema contract нужен для `figmaFiles`; какие поля обязательны для nodes/edges у `componentGraph` и `screenGraph`; какую часть этой модели нужно проявить на project page уже в первой волне, а какую можно оставить только в storage/manifest.

## Миссия

- Что должен изменить этот change: Перевести project storage на disk-backed storage на машине сервера: пользователь задаёт путь при создании проекта, может подключить внешний проект с диска, сохранение идёт фоном-автоматом, проект хранится в читаемых JSON-файлах и каталогах без БД; одновременно убрать legacy runtime-следы и browser-storage compatibility из active project materials и active OpenSpec changes.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-project` уже закрепил project boundary, project registry, component layer, workflow layer и locked workbench shell как последовательные project-facing слои; этот implement не переоткрывает саму границу `Project`, а переводит её storage boundary в disk-backed режим и дочищает active project materials от legacy runtime-следов.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию линии удерживает `focus-domain` вместе с producer/project рамкой, тактику delivery удерживает `dispatcher-project`, итоговую verification и приёмку выполняет внешний проверяющий, а не сам исполнитель.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-storage-browser-local-disk-backed-storage-json: `openspec/specs/projects/spec.md`, `openspec/specs/storage-adapter/spec.md`, `openspec/specs/project-api/spec.md`, `components/desengine/project/ProjectsScreen.tsx`, `components/desengine/project/ProjectOverviewScreen.tsx`, `components/desengine/project/useProjectRegistry.ts`, `components/desengine/project/useProjectOverview.ts`, `components/desengine/project/useProjectWorkspace.ts`, `lib/project/storage-disk.ts`, `lib/project/storage-types.ts`, `lib/project/component-storage.ts`, `lib/project/workspace-storage.ts`, `lib/project/manifest.ts`, `app/api/projects/manifest/route.ts`, `app/api/projects/manifest/export/route.ts`, `app/api/projects/manifest/import/route.ts`, active project-related unit tests в `test/unit/project-*`.

## Границы исполнения

- Что входит в этот change: disk-backed project storage adapter; project registry и active project на сервере; user-facing создание проекта по абсолютному server path; подключение внешнего проекта с диска; autosave project/config/component/session/history на диск; on-disk JSON/catalog layout; удаление browser-local storage и compatibility layer из active project path; вычищение legacy runtime-следов из active project materials и active OpenSpec changes.
- Что сознательно не входит в этот change: database backend; cloud sync; file watcher/daemon; полноценный OS file picker; multi-user locking; изменение install-critical инфраструктуры; переписывание архивных changes; открытие unlocked workbench.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: `Project` остаётся верхним пользовательским контекстом; workflow остаётся отдельным process-layer внутри проекта; workbench остаётся downstream locked shell; проектный путь остаётся главным user-facing маршрутом.

## Проверка результата

- verification_level: static/contract + unit
- verification_command: npm run test:unit -- project && npm run test:traceability
- Что именно должен доказать результат проверки: project storage больше не зависит от browser-local backend и не держит compatibility layer; проект можно создать и подключить по server path; project state сохраняется в читаемые disk files; active project path не описывается через legacy workflow/task-сущность.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какой именно on-disk layout будет canonical в первой волне; как хранить global project registry вне папки продукта и при этом не ограничивать пользовательский project path; какие active changes действительно нужно править для удаления legacy runtime-следов; где проходит минимальная server/client boundary для autosave без browser-local source of truth и без compatibility fallback.

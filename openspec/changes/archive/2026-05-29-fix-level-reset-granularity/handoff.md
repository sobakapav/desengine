## Миссия

- Что должен изменить этот change: дать пользователю возможность безопасно сбросить только текущий уровень, не теряя весь прогресс по задаче.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix-dispatcher уже принял пользовательские friction complaints как валидный источник дефекта, если можно локализовать конкретный interaction problem. Здесь такой источник найден: runtime и UI дают только полный reset задачи.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за granularity reset-операций в многоуровневой задаче.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/iteration/spec.md
- openspec/specs/user-progress/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-reset-granularity: `lib/task/actions/files.ts`, `lib/task/server.ts`, `components/desengine/lab/Workbench/WorkbenchView.tsx`, archive `openspec/changes/archive/2026-05-06-reset-task/`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: отделить reset current level от reset whole task, сохранить пройденные уровни, отразить новую granularity в UI и progress model.
- Что сознательно не входит в этот change: redesign навигации после прохождения задачи, пересборка всей progression-модели, изменение логики перехода между уровнями за пределами reset-сценария.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам факт существования полного reset задачи сохраняется; change добавляет более узкий recovery path, а не отменяет текущий reset.

## Проверка результата

- verification_level: component/browser
- verification_command: npm run test:e2e -- test/e2e/level-reset-granularity.spec.ts
- Что именно должен доказать результат проверки: пользователь может сбросить текущий уровень без потери уже пройденных уровней и без возврата всей задачи в исходное состояние.

## Открытые вопросы

- Как именно хранится и очищается prompt/check history по уровню, если несколько уровней уже были начаты в одной задаче.
- Нужен ли level reset только для текущего уровня или также для любого ранее открытого незавершённого уровня через отдельный entrypoint.

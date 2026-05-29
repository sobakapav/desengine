## Миссия

- Что должен изменить этот change: устранить потерю контекста внутри Workbench, уменьшить лишний скролл и сделать новые файлы уровня заметными.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: parent dispatcher уже отделил UX-жалобы, которые можно локализовать в конкретном interaction defect, от расплывчатого “не нравится интерфейс”. Здесь жалобы сходятся в один источник: слабая видимость ключевого task context и file state внутри Workbench.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за layout-level видимость контекста и файлов в рабочем экране.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/level-labs/spec.md
- openspec/specs/component-file-set/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-workbench-context-visibility: `components/desengine/lab/Workbench/WorkbenchView.tsx`, `components/desengine/task/TaskLevelStart.tsx`, `components/desengine/lab/Code/Code.tsx`, `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: улучшить видимость task-specific контекста и file-state внутри Workbench, сократить вертикальную фрагментацию экрана, сделать multi-file progression явно заметным для пользователя.
- Что сознательно не входит в этот change: полный визуальный редизайн всей лаборатории, runtime preview fixes, изменение didactic content задач.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix не должен превращаться в общую product-стратегию нового workbench; он закрывает локальную проблему видимости и навигации внутри текущего экрана.

## Проверка результата

- verification_level: component/browser
- verification_command: npm run test:e2e -- test/e2e/workbench-context-visibility.spec.ts
- Что именно должен доказать результат проверки: после входа в задачу пользователь видит ключевой контекст без лишнего скролла, а новый файл уровня не остаётся незамеченным.

## Открытые вопросы

- Какой affordance лучше подходит для новых файлов: badge, автофокус, onboarding-callout или комбинация.
- Нужно ли показывать полный task context inline в Workbench или достаточно компактного summary с быстрым раскрытием полного текста.

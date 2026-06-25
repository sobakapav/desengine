## Миссия

- Что должен изменить этот change: сделать project-aware привязку задач видимой на пользовательском уровне, чтобы проект и задача читались как связанная рабочая единица, а не как два независимых экрана.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже признал task layer частью project context, а предыдущие project-wave changes уже сделали task runtime project-aware; не хватает именно user-facing assignment surface.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактическую декомпозицию и приёмку линии держит `dispatcher-project`, итоговую финальную проверку выполняет внешний проверяющий агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- `openspec/changes/producer-project/proposal.md`
- `openspec/specs/projects/spec.md`
- `openspec/specs/task/spec.md`
- `lib/task/project-runtime-scope.ts`
- `lib/task/projection.ts`
- `components/desengine/task/TasksScreen.tsx`
- `app/tasks/page.tsx`
- `app/tasks/[taskId]/page.tsx`

## Границы исполнения

- Что входит в этот change: user-facing assignment model, отображение project binding на task surfaces, список задач проекта и project-aware переходы между страницами проекта и задачи.
- Что сознательно не входит в этот change: JSON-конфиг проекта, UI kit editor, подробная project history, workflow/artifact browser и полная массовая переназначаемость задач между многими проектами.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: canonical `ProjectWorkspace`, active project boundary, project-aware task runtime и workbench/project migration semantics уже заданы предыдущими волнами.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: OpenSpec явно фиксирует двустороннюю project/task видимость как самостоятельный контракт, а реализация не смешивает эту волну с project config/editor или workflow history.

## Открытые вопросы

- В MVP user-facing assignment читается из уже существующего task runtime (`.project-runtime.json`), без создания отдельного нового assignment-реестра.
- Явное ручное перепривязывание задачи к проекту в этот change не входит; текущая волна только проявляет уже зафиксированную runtime-связь и даёт двустороннюю навигацию.

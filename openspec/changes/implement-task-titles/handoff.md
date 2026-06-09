## Миссия

- Что должен изменить этот change: добавить задачам явные человекочитаемые названия, провести их через task contract и показать в user-facing task-поверхностях вместо голого `taskId` там, где это уместно.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-tasks
- strategy_root: focus-onboarding
- release_ref: release-2026-06-09-ui
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-tasks` уже закрепил систему задач как отдельный контур onboarding и требует, чтобы user-facing task experience и связанные runtime-изменения были читаемыми для человека, трассируемыми в OpenSpec и покрыты понятным тестовым слоем.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегический контур держит `focus-onboarding`, тактику task-линии держит `dispatcher-tasks`, итоговую приёмку результата делает внешний проверяющий, а не сам исполнитель change.

## Обязательные источники

- `openspec/changes/dispatcher-tasks/proposal.md`
- `openspec/changes/dispatcher-tasks/design.md`
- `openspec/changes/dispatcher-tasks/tasks.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-task-titles: `openspec/specs/task/spec.md`, `openspec/specs/prompt-context/spec.md` (если title уйдёт в hint templating), `lib/task/schema.ts`, `lib/task/types.ts`, `lib/task/server-runtime-overview.ts`, `components/desengine/task/TaskCard.tsx`, `components/desengine/lab/Workbench/WorkbenchView.tsx`, `onboarding/tasks/*/config.json`

## Границы исполнения

- Что входит в этот change: выбор единого source of truth для task title, протягивание названия через runtime task model, обновление user-facing task-поверхностей и фиксация тестовой/traceability-рамки для нового контракта.
- Что сознательно не входит в этот change: переименование `taskId`, переработка общей IA onboarding, отдельный search/taxonomy-слой по задачам и любые install-critical изменения стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сама task-система уже закреплена родителем; этот change не спорит с ownership и не выносит task titles в отдельный стратегический контур вне `dispatcher-tasks`.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: task title отражён в OpenSpec traceability и не введён ad-hoc; при реализации дополнительно должны быть зафиксированы unit и, при изменении UI, component/browser проверки, подтверждающие, что пользователь видит название задачи как штатную часть task experience.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где именно хранить `title`; нужен ли runtime fallback для старых задач; в какие пользовательские поверхности title обязан попасть в первой волне; должен ли task title стать частью prompt-context для templated hints или оставаться только в UI/runtime task model.

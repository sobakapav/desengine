## Миссия

- Что должен изменить этот change: перевести onboarding entry/task-list surfaces на проектный вход и project-aware объяснение задачи.
- Этот change меняет код только на уровне implement и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-tasks`
- strategy_root: `focus-onboarding`
- Что из родительского change уже решено: content-migration guide уже подготовил схему `проект -> workflow -> проверка/чеклист -> результат`; теперь её нужно начать проявлять в UI.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию удерживает `focus-onboarding`, тактику удерживает `dispatcher-tasks`, финальную verification и приёмку выполняет другой агент или пользователь.

## Обязательные источники

- `openspec/changes/dispatcher-tasks/proposal.md`
- `openspec/changes/dispatcher-tasks/design.md`
- `openspec/specs/task/spec.md`
- `openspec/specs/projects/spec.md`
- `openspec/changes/archive/2026-06-15-implement-project-task-assignment-surface/**`

## Границы исполнения

- Что входит в этот change: project-aware wording и маршрут входа в onboarding-задачу; уточнение task-list и entry CTA; сохранение связи с active project.
- Что сознательно не входит в этот change: workflow-язык progress, check/result surfaces, сокращение user-facing metadata, redesign Workbench.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit`
- Что именно должен доказать результат проверки: пользователь читает onboarding как вход из project context, а не как безымянный каталог задач и уровней.

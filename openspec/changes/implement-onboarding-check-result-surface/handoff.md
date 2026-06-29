## Миссия

- Что должен изменить этот change: связать onboarding check/result surfaces с workflow-шагом, checklist и результатом шага.
- Этот change меняет код только на уровне implement и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-tasks`
- strategy_root: `focus-onboarding`
- Что из родительского change уже решено: новая цепочка заканчивается на `проверка/чеклист -> результат`, а content-migration guide уже зафиксировал минимальную check/result-модель.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию удерживает `focus-onboarding`, тактику удерживает `dispatcher-tasks`, финальную verification выполняет другой агент или пользователь.

## Обязательные источники

- `openspec/changes/dispatcher-tasks/design.md`
- `openspec/specs/task/spec.md`
- `openspec/specs/workflow/spec.md`
- `components/desengine/task/TaskCheckResult.tsx`
- `app/tasks/[taskId]/check/page.tsx`
- `app/lab/[taskId]/check/page.tsx`

## Границы исполнения

- Что входит в этот change: wording и action model для check/recheck/result surfaces; связь результата с workflow-шагом и checklist.
- Что сознательно не входит в этот change: project entry surfaces, общий workflow-language refactor для task/lab, metadata cleanup.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit`
- Что именно должен доказать результат проверки: onboarding check/result surfaces объясняют исход через шаг работы и дают понятный путь к доработке или завершению результата.

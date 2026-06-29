## Миссия

- Что должен изменить этот change: перевести onboarding task/lab/progress surfaces на workflow-язык вместо level-centric wording.
- Этот change меняет код только на уровне implement и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-tasks`
- strategy_root: `focus-onboarding`
- Что из родительского change уже решено: onboarding должен проявляться через цепочку `проект -> workflow -> проверка/чеклист -> результат`; content-migration guide уже разложил старые levels на новый язык.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию удерживает `focus-onboarding`, тактику удерживает `dispatcher-tasks`, финальную verification выполняет другой агент или пользователь.

## Обязательные источники

- `openspec/changes/dispatcher-tasks/design.md`
- `openspec/specs/task/spec.md`
- `openspec/specs/workflow/spec.md`
- `openspec/changes/archive/2026-06-18-implement-project-workflow-title-id-workflow-image-to-component/**`
- `openspec/changes/implement-project-workflow-path-clarity/**`

## Границы исполнения

- Что входит в этот change: замена level-centric wording на workflow-step wording; обновление progress labels; уточнение task/lab headings и status-текстов.
- Что сознательно не входит в этот change: project entry surfaces, check/result flow, metadata cleanup.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit`
- Что именно должен доказать результат проверки: onboarding user-facing surfaces объясняют текущую работу через workflow-шаг и его смысл, а не через номер уровня.

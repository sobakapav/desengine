## Миссия

- Что должен изменить этот change: сократить user-facing metadata в onboarding до набора, нужного для режима `project/workflow/check/result`.
- Этот change меняет код только на уровне implement и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-tasks`
- strategy_root: `focus-onboarding`
- Что из родительского change уже решено: onboarding должен перейти на новую пользовательскую цепочку без лишнего legacy-шумa; content-migration guide уже разделил metadata на project/workflow/check/result блоки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию удерживает `focus-onboarding`, тактику удерживает `dispatcher-tasks`, финальную verification выполняет другой агент или пользователь.

## Обязательные источники

- `openspec/changes/dispatcher-tasks/design.md`
- `openspec/specs/task/spec.md`
- `openspec/specs/projects/spec.md`
- `openspec/specs/workflow/spec.md`
- текущие onboarding task/task-list/check/result surfaces

## Границы исполнения

- Что входит в этот change: user-facing metadata cleanup; скрытие или понижение старых level/task полей; удержание project/workflow/check/result данных как основных.
- Что сознательно не входит в этот change: project entry refactor, workflow-language refactor, check/result logic refactor.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit`
- Что именно должен доказать результат проверки: onboarding surfaces показывают только нужный для нового режима контекст и не засоряют UI внутренними legacy metadata.

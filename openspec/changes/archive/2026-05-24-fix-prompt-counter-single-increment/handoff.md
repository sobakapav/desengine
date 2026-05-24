## Миссия

- Что должен изменить этот change: считать один пользовательский prompt ровно одной попыткой и не списывать лимит дважды
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix change не пересматривает модель task-уровней, а чинит локальный дефект исполнительского runtime вокруг учёта пользовательского prompt.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия и приоритизация остаются за dispatcher-bugfix и релизным dispatcher.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/dispatcher-bugfix/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-prompt-counter-single-increment: `lib/task/server-runtime-mutations.ts`, `lib/task/server-runtime-progress.ts`, `openspec/specs/iteration/spec.md`, `openspec/specs/task-levels/spec.md`

## Границы исполнения

- Что входит в этот change: исправить двойной инкремент `promptsUsed` после одного пользовательского prompt и покрыть это unit-тестом.
- Что сознательно не входит в этот change: пересмотр лимитов `maxPromptsPerTask` и `maxCheckAttempts`, UI-переосмысление лаборатории и общая модель прогресса уровня.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: раздельные сущности prompt-history, progress summary и проверочный flow уровня.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: после записи одного нового entry в `prompt-history` mutation `registerPromptForCurrentLevel` оставляет `promptsUsed = 1`, а не `2`, и не ломает summary текущего уровня.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: подтвердить источник двойного инкремента между `reconcileTaskProgressWithHistory` и `registerPromptForCurrentLevel`.

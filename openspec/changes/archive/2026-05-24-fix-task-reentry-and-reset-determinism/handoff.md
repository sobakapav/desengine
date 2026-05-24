## Миссия

- Что должен изменить этот change: стабилизировать повторный вход в задачу, переход на следующий уровень и reset без дрейфа описания и варианта
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: change относится к потоку точечных исправлений и не пересматривает продуктовую модель уровней, reset и task-specific контекст как таковые; нужно только устранить недетерминированную подгрузку payload для ещё не начатого текущего уровня.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия и релизная маршрутизация остаются у parent dispatcher/release; этот fix отвечает только за локальную реализацию и unit-покрытие.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/dispatcher-bugfix/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-task-reentry-and-reset-determinism: `openspec/specs/task-levels/spec.md`, `openspec/specs/level-labs/spec.md`, `openspec/specs/user-progress/spec.md`, `app/api/tasks/[taskId]/route.ts`, `app/lab/[taskId]/page.tsx`, `app/lab/[taskId]/[screen]/page.tsx`, `app/tasks/[taskId]/check/page.tsx`, `lib/task/actions/shared.ts`.

## Границы исполнения

- Что входит в этот change: выровнять загрузку `taskData` для task route/page flow так, чтобы ещё не начатый текущий уровень всегда получал пустой payload с актуальным `labContext`, даже если у задачи остались файлы и история от предыдущего уровня.
- Что сознательно не входит в этот change: пересмотр UX переходов, sandpack preview логики предыдущего уровня, изменение модели reset или структуры task progress.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сама модель уровней, наличие стартового экрана для не начатого уровня, хранение task-specific пояснений и общая release-маршрутизация.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: route/page/task-action слой больше не восстанавливает старые пользовательские файлы для не начатого текущего уровня и стабильно отдаёт пустой `taskData` с актуальным `labContext`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: metadata change сейчас расходится с этим handoff (`dispatcher-workbench`/`focus-features` в `.openspec.yaml` против `dispatcher-bugfix`/`focus-quality` здесь) и требует отдельного решения владельца OpenSpec.

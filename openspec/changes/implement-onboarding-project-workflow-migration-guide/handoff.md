## Миссия

- Что должен изменить этот change: подготовить практическую инструкцию для контент-менеджера по миграции onboarding-задач и metadata в проектный и workflow режимы
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-tasks`
- strategy_root: `focus-onboarding`
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: task-система onboarding должна переходить в проектный и workflow режимы через отдельные content/UI waves; эта волна считается первой обязательной и подготавливает остальные.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-onboarding`, тактику держит `dispatcher-tasks`, этот implement change отвечает за content-migration guide.

## Обязательные источники

- `openspec/changes/dispatcher-tasks/proposal.md`
- `openspec/changes/dispatcher-tasks/design.md`
- `openspec/specs/task/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-onboarding-project-workflow-migration-guide: `openspec/specs/workflow/spec.md`, `openspec/specs/projects/spec.md`, текущие onboarding task configs и все активные onboarding content surfaces.

## Границы исполнения

- Что входит в этот change: инвентаризация текущей onboarding-структуры, mapping старых и новых metadata, инструкция для контент-менеджера, примеры и checklist готовности.
- Что сознательно не входит в этот change: кодовая миграция onboarding UI, переписывание runtime-контрактов и массовая правка всех onboarding-задач.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: тактическая рамка onboarding-линии и общий стратегический фокус onboarding как отдельного контура.

## Проверка результата

- verification_level: `static/contract`
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: implement change содержит достаточно конкретную instruction-wave, которую можно брать в работу без повторного исследования структуры задач и metadata.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие onboarding metadata обязательны для project/workflow режима; какие старые level-поля удалить или архивировать; какие примеры нужны контент-менеджеру для реальной миграции.

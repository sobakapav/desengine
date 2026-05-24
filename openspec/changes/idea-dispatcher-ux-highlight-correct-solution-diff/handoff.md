## Миссия

- Зафиксировать UX-идею: после принятого решения показывать пользователю, какие именно изменения оказались существенными.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` удерживает UX как quality-контур, а `dispatcher-ux` владеет его downstream гипотезами и improvements.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегически идея относится к `focus-quality`, тактически — к орбите `dispatcher-ux`.

## Обязательные источники

- openspec/changes/dispatcher-ux/design.md
- openspec/changes/focus-quality/roadmaps/ux-quality.md
- openspec/specs/task/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для idea-dispatcher-ux-highlight-correct-solution-diff: текущие check-result и task completion flows.

## Границы исполнения

- Что входит в этот change: сама UX-идея, её дидактический смысл и список downstream вопросов.
- Что сознательно не входит в этот change: реализация diff-viewer, серверной аналитики или нового explanation pipeline.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: действующий check-flow не меняется без отдельного downstream change.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: idea оформлена как UX-гипотеза и не подменяет собой implementation-change.

## Открытые вопросы

- Где проходит граница между полезным объяснением и преждевременным раскрытием решения.

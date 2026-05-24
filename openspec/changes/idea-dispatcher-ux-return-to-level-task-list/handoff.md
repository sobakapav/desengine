## Миссия

- Зафиксировать UX-идею: после завершения задачи возвращать пользователя к списку задач уровня вместо автоматического перехода в следующий уровень той же задачи.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` допускает UX-линию как отдельный quality-контур, а `dispatcher-ux` владеет downstream UX-гипотезами и UX-risks.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегически идея живёт в `focus-quality`, тактически относится к орбите `dispatcher-ux`.

## Обязательные источники

- openspec/changes/dispatcher-ux/design.md
- openspec/changes/focus-quality/roadmaps/ux-quality.md
- openspec/specs/task-levels/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для idea-dispatcher-ux-return-to-level-task-list: `user-progress` и текущие task transition flows.

## Границы исполнения

- Что входит в этот change: UX-гипотеза, её границы и вопросы для downstream проверки.
- Что сознательно не входит в этот change: кодовые изменения и немедленная смена текущего product-contract.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: текущий task progression остаётся действующим до отдельного downstream change.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: idea корректно оформлена и фиксирует UX-гипотезу без подмены runtime-реализации.

## Открытые вопросы

- Как отделить «успех внутри задачи» от «естественного момента возврата к списку задач уровня».

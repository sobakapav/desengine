## Миссия

- После завершения задачи возвращать пользователя к списку задач уровня вместо автоматического перехода в следующий уровень той же задачи.

## Унаследованный контекст

- parent_change: dispatcher-ux
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` уже перевёл эту тему на уровень прямой реализации как change UX-маршрута после успеха.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику и приёмку результата держит `dispatcher-ux`.

## Обязательные источники

- openspec/changes/dispatcher-ux/design.md
- openspec/changes/focus-quality/roadmaps/ux-quality.md
- openspec/specs/task-levels/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-ux-return-to-level-task-list: `user-progress` и текущие task transition flows.

## Границы исполнения

- Что входит в этот change: прямое изменение маршрута после успеха, проверки route/transition и traceability.
- Что сознательно не входит в этот change: полный пересмотр progression-flow или персонализируемые post-success маршруты.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: решение делать это implement-change уже принято `dispatcher-ux`; change не должен возвращаться к стадии UX-идеи.

## Проверка результата

- verification_level: e2e smoke
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: change корректно встроен в traceability и получает browser/e2e проверку маршрута после успешного завершения задачи.

## Открытые вопросы

- Как отделить «успех внутри задачи» от «естественного момента возврата к списку задач уровня».

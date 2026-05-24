## Миссия

- Зафиксировать `dispatcher-bugfix` как управляющий change для входящего потока багов: он принимает жалобы, симптомы и внешние ссылки, превращает их в нормализованные bug-кандидаты и направляет в downstream `fix` changes, но сам не меняет runtime-код напрямую.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` выделяет качество в отдельный управленческий контур и допускает под собой dispatcher'ы, которые превращают quality-сигналы в проверяемые downstream changes.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия принадлежит `focus-quality`, тактика intake и маршрутизации багов принадлежит `dispatcher-bugfix`, приёмка кодовых исправлений происходит в соответствующих дочерних `fix` changes.

## Обязательные источники

- openspec/changes/focus-quality/proposal.md
- openspec/changes/focus-quality/design.md
- openspec/changes/focus-quality/tasks.md
- openspec/changes/focus-quality/roadmaps/bugfix-dispatching.md
- openspec/changes/dispatcher-openspec/design.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/changes/dispatcher-ux/design.md
- Какие ещё файлы и спецификации обязательны к чтению для dispatcher-bugfix: downstream dispatcher и capability-спеки, относящиеся к конкретному багу, который попал в разбор.

## Границы исполнения

- Что входит в этот change: intake жалоб, анализ симптомов и внешних ссылок, первичная формулировка наблюдаемой проблемы, оценка потенциального capability/scenario, выбор владельца исправления и создание downstream `fix`/`producer`/дочернего `dispatcher` change при необходимости.
- Что сознательно не входит в этот change: непосредственное исправление кода, изменение install-critical инфраструктуры, переоткрытие продуктовой стратегии и выполнение финальной проверки готового `fix`.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам `focus-quality` определяет, что quality-сигналы должны переходить в управляемые changes с явной тестовой частью; `dispatcher-bugfix` не отменяет доменные решения `dispatcher-ux`, `dispatcher-test-system` и других профильных dispatcher'ов, а направляет баг в их зону, если проблема уже имеет явного владельца.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: change оформлен полноценно, привязан к `focus-quality`, имеет roadmap-ссылку и явно задаёт правила превращения баговых сигналов в downstream `fix` changes с понятной тестовой частью.

## Открытые вопросы

- Нужен ли отдельный producer для массового анализа повторяющихся жалоб или достаточно заводить его точечно под конкретные волны багов.
- Когда баг должен оставаться в контуре `dispatcher-bugfix`, а когда его нужно поднимать в отдельный доменный dispatcher из-за повторяемости и объёма.

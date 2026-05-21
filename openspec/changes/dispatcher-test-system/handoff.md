## Миссия

- Зафиксировать `dispatcher-test-system` как управляющий change тестовой подсистемы: он удерживает контракт `testing-layer`, создаёт и контролирует downstream `implement`/`fix` changes, но сам не меняет runtime-код напрямую.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` выделяет тестовую подсистему в отдельный quality-контур и ожидает от `dispatcher-test-system` явного управления roadmap, traceability-практикой, правилами test levels и downstream исполнительскими changes.

## Обязательные источники

- openspec/changes/focus-quality/proposal.md
- openspec/changes/focus-quality/design.md
- openspec/changes/focus-quality/tasks.md
- openspec/specs/testing-layer/spec.md
- openspec/changes/focus-quality/roadmaps/test-system.md
- openspec/changes/dispatcher-openspec/design.md

## Границы исполнения

- Что входит в этот change: описание роли dispatcher, фиксация его ответственности за контракт `testing-layer`, roadmap и downstream `implement`/`fix` changes, а также правила человеко-понятной тестовой части у дочерних behavior-change.
- Что сознательно не входит в этот change: непосредственная реализация test harness, новых test-команд, новых runtime-проверок, install-critical перестройки и любые кодовые изменения вне отдельных downstream implement/fix changes.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: change оформлен полноценно, spec delta для `testing-layer` согласована с proposal/design/tasks, а роль dispatcher как управляющего контейнера для downstream implement/fix changes выражена явно.

## Открытые вопросы

- Нужно ли выделить отдельный producer для матрицы test levels и coverage-gap управления, если объём исследовательской работы вырастет.
- Нужен ли отдельный downstream dispatcher для live/provider-проверок, если этот контур начнёт эволюционировать независимо от общего test-system roadmap.

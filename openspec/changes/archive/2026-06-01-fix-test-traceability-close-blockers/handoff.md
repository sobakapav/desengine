## Миссия

- Что должен изменить этот change: снять внешние traceability-блокеры, мешающие os:close дочерних test-system fixes
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-test-system` требует, чтобы downstream fixes закрывались через честный traceability-слой, а не зависали на постороннем metadata noise.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-test-system`; этот fix отвечает только за снятие трёх конкретных traceability-blockers, которые сейчас мешают `os:close`.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/changes/dispatcher-test-system/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-test-traceability-close-blockers: `openspec/specs/task/spec.md`, `openspec/specs/level-labs/spec.md`, `openspec/specs/component-file-set/spec.md`, `test/e2e/safari-task-runtime-instability.spec.ts`, `test/unit/task-start-llm.test.ts`, `test/unit/project-ui-kit-switching.test.ts`, `test/traceability/coverage-plan.json`.

## Границы исполнения

- Что входит в этот change: исправление `@openSpec` scenario-ссылок и тестового покрытия, которые сейчас ломают `npm run test:traceability`.
- Что сознательно не входит в этот change: product runtime fixes Safari, start payload logic, preview runtime, изменения install-critical стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: канонический browser wrapper-path и политика `os:close` уже зафиксированы в `fix-codex-browser-verification-gate`; здесь чинится только внешний traceability-шум.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: три текущих blocker'а исчезли, а `os:close` для downstream test-system fixes больше не режется на этих посторонних traceability-ошибках.

## Открытые вопросы

- Нужны ли дополнительные изменения в coverage-plan, если все три blocker'а закрываются прямыми test annotations без искусственных исключений.

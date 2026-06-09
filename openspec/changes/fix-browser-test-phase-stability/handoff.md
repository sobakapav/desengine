## Миссия

- Что должен изменить этот change: стабилизировать browser-фазу тестирования как управляемый phase-level verification-контур, который честно разделяет bootstrap, launch, fixture, product и cleanup verdict.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-test-system` уже закрепил, что изменения test runtime/tooling оформляются отдельными downstream changes, а browser verification не может подменяться unit/static зеленью.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию test-system удерживает `dispatcher-test-system`; тактику этого fixes задаёт сам change; итоговую приёмку browser-phase делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-test-system/proposal.md`
- `openspec/changes/dispatcher-test-system/design.md`
- `openspec/changes/dispatcher-test-system/tasks.md`
- `openspec/specs/testing-layer/spec.md`
- `openspec/specs/admin-tools/spec.md`
- `openspec/changes/archive/2026-06-01-fix-browser-verification-runtime/proposal.md`
- `openspec/changes/archive/2026-06-01-fix-browser-verification-runtime/design.md`
- `openspec/changes/archive/2026-06-02-fix-browser-wrapper-managed-dev-cleanup/proposal.md`
- Какие ещё файлы и спецификации обязательны к чтению для fix-browser-test-phase-stability: `docs/testing-layer.md`, `test/README.md`, `playwright.e2e.config.ts`, `tools/testing/run-browser-verification-runtime.mjs`, `tools/testing/browser-target-preflight.mjs`, `test/e2e/browser-verification-runtime.spec.ts`, `test/unit/browser-verification-runtime.test.ts`.

## Границы исполнения

- Что входит в этот change: phase-level browser verification contract, оркестрация wrapper-path, классификация browser-phase failures, guardrails для admin close-path и документация канонического режима запуска.
- Что сознательно не входит в этот change: исправление конкретных продуктовых browser-spec, ослабление product assertions, install-critical перестройка стека и ручная подмена browser verdict документационными компромиссами.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: browser-приёмка остаётся обязательной там, где она уже заявлена; direct unit/static verdict не заменяет browser-phase verification; dispatcher по-прежнему не реализует код сам.

## Проверка результата

- verification_level: component/browser
- verification_command: node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts
- Что именно должен доказать результат проверки: browser verification выдаёт воспроизводимый phase-level verdict, по которому можно отличить системную неготовность browser-фазы от продуктового дефекта и от post-run cleanup instability.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: достаточно ли одной общей phase-модели для всех browser-spec или для части flows понадобится дополнительная фаза readiness поверх `fixture-ready`; как именно structured phase verdict должен потребляться `os:close`.

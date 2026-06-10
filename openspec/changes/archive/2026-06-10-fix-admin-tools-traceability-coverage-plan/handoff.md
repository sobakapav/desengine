## Миссия

- Что должен изменить этот change: Закрыть process-блокер traceability: честно оформить неполное покрытие capability admin-tools через coverage-plan или точечное evidence
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: traceability считается обязательным базовым контуром для изменений тестового слоя, а недостающее покрытие должно закрываться либо точечным evidence, либо явной записью в `test/traceability/coverage-plan.json`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-quality`, тактику и приёмку тестового контура ведёт `dispatcher-test-system`, этот fix закрывает только исполнительский process-хвост.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/changes/dispatcher-test-system/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-admin-tools-traceability-coverage-plan: `openspec/specs/admin-tools/spec.md`, `test/traceability/coverage-plan.json`, `test/unit/openspec-roadmap-inheritance.test.ts`, `test/unit/openspec-producer-list.test.ts`, `tools/testing/traceability/report.mjs`.

## Границы исполнения

- Что входит в этот change: локализация непокрытых `admin-tools` scenarios, добор минимального честного traceability evidence в unit-слое или явная фиксация остатка в `coverage-plan`, обновление artifacts этого fix change.
- Что сознательно не входит в этот change: любые `project`, `task`, `workflow`, `workbench`, browser/runtime и install-critical изменения, а также переписывание всего capability `admin-tools`.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: правило "код меняют только implement/fix", структура ролей OpenSpec, обязательность `test:traceability` и общий контракт `admin-tools`.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: все 35 scenarios capability `admin-tools` либо покрыты @openSpec evidence, либо честно перечислены в `coverage-plan`; `npm run test:traceability` больше не блокируется на `admin-tools`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие именно три scenario сейчас отсутствуют в traceability, покрываются ли они уже существующими unit-тестами без metadata, и нужен ли отдельный `coverage-plan` entry вместо нового evidence.
- Статус после исполнения: локализованы три scenario (`Producer напрямую управляет исполнительским change`, `Producer появляется раньше формализованных требований и сценариев`, `Implement или fix напрямую подчиняется producer`); выбран путь через unit-evidence, отдельный `coverage-plan` для `admin-tools` не потребовался.

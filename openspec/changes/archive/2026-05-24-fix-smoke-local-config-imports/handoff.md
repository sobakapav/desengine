## Миссия

- Что должен изменить этот change: обновить smoke и соседние tools на актуальный путь локального конфига без падения на старом импорте
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-install
- strategy_root: focus-tech
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: install/setup/tooling bugs живут в отдельном dispatcher; smoke/preflight/onboarding-sync fixes оформляются как downstream `fix`; tooling и config-contract не должны расходиться молча.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия — `focus-tech`, тактика — `dispatcher-install`, приёмка — родительский агент релизного потока через внешнюю проверку.

## Обязательные источники

- openspec/changes/dispatcher-install/proposal.md
- openspec/changes/dispatcher-install/design.md
- openspec/changes/dispatcher-install/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-smoke-local-config-imports: `openspec/specs/external-local-onboarding/spec.md`, `openspec/specs/testing-layer/spec.md`, `tools/smoke-local-install.mjs`, `tools/repair-onboarding.mjs`, `tools/generate-allowlist-marker.mjs`, `lib/system/config/local.cjs`, `test/unit/p2-source-contracts.test.ts`

## Границы исполнения

- Что входит в этот change: обновить legacy-import пути в install-tools на канонический модуль локального конфига; добавить regression-check в source-contract; при необходимости привести OpenSpec артефакты fix в исполнимое состояние.
- Что сознательно не входит в этот change: изменение формата `desengine.config.txt`, перестройка runtime-конфига приложения, docs-редизайн install-flow, изменение install-critical стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: install-контур остаётся в `dispatcher-install`; канонический локальный конфиг — `desengine.config.txt`; smoke запускается через `npm run smoke`.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: install-tools импортируют рабочий канонический helper локального конфига и не содержат старого пути `../lib/local-config.cjs`; smoke-контур остаётся привязан к `desengine.config.txt` и `ONBOARDING_REPO_URL`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: остались ли ещё install-tools на legacy-import пути; достаточно ли source-contract проверки без отдельного runtime smoke в рамках этого узкого fix.

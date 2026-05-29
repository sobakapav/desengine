## Миссия

- Вернуть `spec-coverage-map.json` в состояние полного отражения active OpenSpec capability, чтобы тестовый слой снова имел целостную карту покрытия.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- producer_ref: producer-test-system-current-state
- release_ref: (не задан)
- Родительский dispatcher удерживает контракт `testing-layer`, а producer уже зафиксировал baseline-разрыв между active specs и coverage map.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/changes/dispatcher-test-system/tasks.md
- openspec/specs/testing-layer/spec.md
- test/traceability/spec-coverage-map.json
- test/traceability/coverage-plan.json
- openspec/changes/producer-test-system-current-state/baseline.md

## Границы исполнения

- Входит: полнота и согласованность `spec-coverage-map.json`, при необходимости минимальное выравнивание `coverage-plan.json`.
- Не входит: добавление новых unit/e2e/integration тестов, расширение runtime-контракта capability и закрытие всех metadata-gaps тестовых файлов.

## Проверка результата

- verification_level: traceability
- verification_command: npm run test:traceability
- Результат должен доказать, что карта покрытия учитывает все active capability и не молчит о пропущенных контрактах.

## Открытые вопросы

- Нужно ли после этого fix выделять отдельный child change на `@openSpec` metadata-gaps тех тестов, которые уже существуют, но ещё не встроены в traceability.

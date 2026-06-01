## Миссия

- Превратить `test:live` из placeholder в минимально полезный live preflight: он должен честно читать provider env, объяснять недостающие переменные и не делать реальных вызовов.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- producer_ref: producer-test-system-current-state
- release_ref: (не задан)
- Родительский dispatcher удерживает testing-layer как систему, а producer baseline уже подтвердил, что текущий `test:live` не соответствует ожидаемому минимальному usefulness.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/changes/dispatcher-test-system/tasks.md
- openspec/specs/testing-layer/spec.md
- docs/testing-layer.md
- test/README.md
- test/helpers/test-env.ts
- tools/testing/pending-layer.mjs
- openspec/changes/producer-test-system-current-state/baseline.md

## Границы исполнения

- Входит: env-aware preflight для `test:live`, unit-покрытие, документация.
- Не входит: реальные provider HTTP-вызовы, включение `test:live` в `test:full`, integration/e2e работа и новые live credentials.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Результат должен доказать, что `test:live` больше не является пустым placeholder и даёт понятную безопасную диагностику без сетевых эффектов.

## Открытые вопросы

- Нужно ли следующим child change делать уже настоящий live/provider probe, или достаточно оставить `test:live` как preflight до появления отдельного безопасного live-контура.

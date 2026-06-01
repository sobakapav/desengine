## Миссия

- Превратить `test:integration` из placeholder в реальный integration runner для server/API-flow.
- Итог должен дать reusable слой, на который downstream changes смогут навешивать route suites без смешения unit и e2e.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- producer_ref: producer-test-system-current-state
- release_ref: release-2026-06-01-grooming
- Producer baseline уже зафиксировал, что сейчас `test:integration` пуст и нужен отдельный runner на mock/fixture boundary.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/specs/testing-layer/spec.md
- openspec/changes/producer-test-system-current-state/baseline.md
- openspec/changes/producer-test-system-current-state/roadmaps/test-system-current-state.md
- docs/testing-layer.md
- test/README.md
- package.json
- vitest.config.ts
- tools/testing/pending-layer.mjs
- app/api/**/route.ts

## Границы исполнения

- Входит: integration runner, shared harness/helpers, документация и minimal proof suite самого слоя.
- Не входит: browser/e2e, live/provider вызовы, включение integration в `test:full`, полное покрытие всех route handlers.
- Уже принятые решения, которые нельзя переоткрывать: integration должен оставаться без браузера и без live credentials; e2e остаётся отдельным слоем.

## Проверка результата

- verification_level: integration
- verification_command: npm run test:integration
- Результат должен доказать, что `test:integration` больше не placeholder и запускает реальный server/API integration слой.

## Открытые вопросы

- Какие shared helpers лучше сделать общими для всех route suites, а какие оставить внутри первой route-wave.

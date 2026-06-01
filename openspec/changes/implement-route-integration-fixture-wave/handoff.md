## Миссия

- Наполнить новый integration runner первой волной реальных route/API сценариев, которые ловят ошибки склейки server boundary раньше e2e и ближе к контракту, чем source-only unit.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- producer_ref: producer-test-system-current-state
- release_ref: release-2026-06-01-grooming
- Producer baseline уже выделил `test:integration` как один из главных пробелов тестовой системы.
- Foundation runner должен прийти из `implement-integration-test-runner-foundation`; эта wave не должна пытаться заменять его собственным ad-hoc harness.

## Обязательные источники

- openspec/changes/implement-integration-test-runner-foundation/proposal.md
- openspec/changes/implement-integration-test-runner-foundation/design.md
- openspec/specs/task/spec.md
- openspec/specs/iteration/spec.md
- openspec/specs/llm/spec.md
- openspec/specs/onboarding-repo/spec.md
- openspec/specs/testing-layer/spec.md
- app/api/tasks/[taskId]/**
- app/api/status/llm/route.ts
- app/api/onboarding/update/route.ts
- существующие unit-тесты на service boundary и status contracts

## Границы исполнения

- Входит: task route integration, LLM status route integration, onboarding update route integration, traceability metadata этих suite.
- Не входит: browser/e2e, live providers, отдельная auth verify wave, `/api/system/update`, изменение продуктового поведения route handlers.
- Уже принятые решения, которые нельзя переоткрывать: integration должен идти поверх foundation runner и оставаться fixture-only.

## Проверка результата

- verification_level: integration
- verification_command: npm run test:integration
- Результат должен доказать, что первая волна route/API integration реально исполняется и закрывает ключевые spec-сценарии без live credentials.

## Открытые вопросы

- Нужна ли следующая отдельная wave для auth verify и `/api/system/update`, или их лучше закрывать вместе с будущим capability-runner `test:spec`.

# Roadmap: Test System Current State

`producer-test-system-current-state` ведёт roadmap текущего состояния тестовой подсистемы.

- Фиксирует gaps, baseline и ожидания к развитию test-system.
- Не владеет implement-исполнителями; передаёт delivery в dispatcher-test-system.
- Конфликты между baseline-ожиданием producer и тактическим ритмом dispatcher видимы и полезны.

## Подтверждённые ближайшие follow-up changes

- `fix-test-spec-coverage-map-completeness`
  - parent: `dispatcher-test-system`
  - задача: выровнять `test/traceability/spec-coverage-map.json` с полным набором active capability.

- `implement-live-provider-test-preflight`
  - parent: `dispatcher-test-system`
  - задача: заменить placeholder `test:live` на env-aware preflight с понятной диагностикой.

- `implement-integration-test-runner-foundation`
  - parent: `dispatcher-test-system`
  - задача: заменить placeholder `test:integration` на runnable integration runner для server/API-flow.

- `implement-route-integration-fixture-wave`
  - parent: `dispatcher-test-system`
  - задача: наполнить integration runner первой волной route/API сценариев для task routes, LLM status и onboarding update.

## Подтверждённые gaps без немедленного child change

- `test:spec -- <capability>` остаётся placeholder и требует отдельного implement-change под `dispatcher-test-system`.
- Разблокировка skipped protected-route smoke зависит от незавершённого runtime-переезда `task/user schema`; dispatcher исполнения сейчас неочевиден.
- Наполнение Storybook/component слоя требует разделения между общим test harness и доменными UX/feature contract changes.

## Снятый follow-up

- Отдельный fix под `dispatcher-openspec` на `openspec-handoff` traceability не retained:
  - mismatch из baseline уже устранён в текущем дереве другим изменением;
  - новый child change не дал бы дополнительного улучшения тестовой системы.

## Why

`test:full` должен оставаться детерминированным и не зависеть от внешнего onboarding checkout. Но из этого не следует, что проверка реального onboarding больше не нужна. Если мы оставим только unit-фикстуры, то кодовая логика будет зелёной даже в ситуации, когда настоящий `onboarding` после `repair` больше не совместим со smoke/runtime-контрактом.

Пользователю и внешнему проверяющему нужен отдельный runnable-слой, который явно отвечает на вопрос: “реальный onboarding checkout синхронизируется, читается и проходит preflight так, как ожидает система”.

## What Changes

- Вводится implement-change `implement-test-real-onboarding-smoke-contract` под `dispatcher-test-system`.
- Change возвращает отдельный smoke/integration-контракт для реального onboarding checkout:
  - проверка работает не на unit-фикстуре, а на реальном checkout после `repair` или на уже синхронизированном `onboarding`;
  - контракт явно отделён от `test:full`, чтобы обязательный быстрый слой не зависел от внешнего репозитория и credentials;
  - smoke-путь фиксирует условия запуска, диагностику ошибок источника и критерий “onboarding действительно совместим с runtime/tooling”.
- Change должен обновить OpenSpec и документацию тестового слоя так, чтобы distinction между deterministic unit и real onboarding smoke был явно описан.

## Non-goals

- Не возвращать прямую зависимость `test:full` от внешнего onboarding-репозитория.
- Не переносить весь onboarding lifecycle в unit-слой.
- Не менять install-critical инфраструктуру или сетевую механику `git clone` без отдельной необходимости.

## Capabilities

### Modified Capabilities

- `testing-layer`: у системы есть отдельный runnable smoke/integration-контракт для проверки реального onboarding checkout.
- `external-local-onboarding`: локальная установка и preflight явно подтверждают совместимость реального onboarding с runtime/tooling контрактом.

## Acceptance Criteria

- Реальный onboarding checkout проверяется отдельной runnable-командой и не смешивается с unit-фикстурами.
- `test:full` остаётся deterministic и не требует внешнего onboarding source.
- Документация и OpenSpec объясняют, как именно проверить реальный onboarding и какие env/credentials для этого нужны.
- Если smoke не может подтвердить реальный onboarding, пользователь получает диагностику про источник/layout/sync state, а не абстрактную ошибку unit-слоя.

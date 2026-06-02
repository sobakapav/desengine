## Why

`fix-codex-browser-verification-gate` по существу уже готов к закрытию, но штатный `npm run os:close` останавливается на посторонних traceability-ошибках в других active test artifacts. Пока эти ошибки живут в репозитории, любой test-system fix может ложно выглядеть незакрываемым.

## What Changes

- Исправить неверную scenario-ссылку в browser test `fix-safari-task-runtime-instability`.
- Исправить неверную scenario-ссылку в unit test `fix-level-5-start-file-id-payload`.
- Закрыть недостающее покрытие `level-labs` для сценария rehydration project settings.
- Довести `npm run test:traceability` до зелёного состояния как обязательный слой для downstream test-system fixes.

## Impact

- `os:close` для дочерних changes `dispatcher-test-system` перестаёт блокироваться чужим traceability-шумом.
- Активные fixes получают корректные `@openSpec` ссылки вместо drift между тестами и spec.
- Покрытие `level-labs` снова становится полным без искусственной записи в coverage-plan.

## Why

Сейчас тестовый слой умеет отвечать на вопрос "поведение сломалось или нет", но почти не умеет отвечать на вопрос "стало ли заметно медленнее". Для линии `producer-speed-and-load` это уже недостаточно: без budget verdicts деградации latency будут обнаруживаться слишком поздно и обсуждаться на уровне ощущений, а не проверяемого контракта.

## What Changes

- Вводится implement-change `implement-test-performance-budget-verdicts` под `dispatcher-test-system`.
- Change должен добавить в тестовый слой явные performance verdicts для ключевых user-facing сценариев `npm run start`.
- Verdict model должна различать как минимум:
  - `ok`;
  - `regression`;
  - `budget-exceeded`.
- Budget assertions должны опираться на controlled fixture/mocked режим, а не на live/provider нестабильность.
- На первом шаге change должен закрыть минимальный набор speed-critical путей:
  - task page / lab entry;
  - preview payload build;
  - `start`;
  - `iterate`;
  - `check`.

## Non-goals

- Не превращать весь e2e слой в performance bench lab.
- Не вводить machine-specific абсолютные цифры без controlled fixture strategy.
- Не заменять runtime observability: тестовые verdicts и runtime diagnostics остаются разными слоями.

## Capabilities

### Modified Capabilities

- `testing-layer`: тестовый слой получает явные performance verdicts и budget assertions для user-facing speed regressions.

## Acceptance Criteria

- В тестовом слое появляется reusable механизм performance verdicts.
- Для key paths `npm run start` зафиксированы первые budget checks в controlled режиме.
- Тесты различают функциональный успех и speed regression.
- В tasks зафиксированы mock/fixture-данные и команды запуска без live credentials.

## Why

`/auth` и другие страницы, использующие `getResourceStates()`, могут зависать на 9-15 секунд в `next dev`, даже когда сам route и Turbopack живы. Локализация показала, что часть этой задержки создаёт не shell и не navigation, а последовательное ожидание двух сетевых diagnostics probes: LLM и allowlist.

## What Changes

- `getResourceStates()` больше не ждёт LLM и allowlist network probes последовательно.
- Сбор системных ресурсов сохраняет те же статусы, тексты и порядок resource cards, но запускает независимые probes параллельно.
- Добавляется адресный unit-слой, который удерживает этот runtime contract и не даёт вернуть serial execution на auth-path.

## Capabilities

- `resource-status`: сбор диагностики системных ресурсов

## Impact

- Сокращается искусственная latency auth/system path, когда оба probe доходят до собственных таймаутов.
- Пользовательский контракт resource cards не меняется: меняется только runtime orchestration внутри diagnostics layer.

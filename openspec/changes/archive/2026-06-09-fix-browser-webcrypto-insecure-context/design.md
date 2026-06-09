## Context

Симптом проявляется в браузере, но сам root cause почти наверняка находится на boundary между клиентским кодом и криптографическим модулем доступа. В репозитории `crypto.subtle` используется в access/allowlist-контуре, и такой код нельзя случайно втягивать в клиентский runtime, если он требует secure context.

Нужно исправить не просто текст ошибки, а сам drift runtime boundary: browser-путь не должен зависеть от server-side crypto helper'ов или должен иметь явный безопасный fallback.

## Goals

- Локализовать, какой import/runtime path втягивает Web Crypto в browser.
- Убрать зависимость клиентского рантайма от `crypto.subtle.digest` на insecure origin.
- Добавить regression guard, который не даст вернуть этот crash-path.

## Non-goals

- Не строить новый auth flow.
- Не менять transport/browser policy вокруг `http` и `https` шире необходимого.

## Decisions

1. Криптография допуска должна жить в server-side boundary.
   - Browser-код не должен напрямую зависеть от helper'ов, требующих Web Crypto для подписи или digest.

2. Regression guard должен проверять boundary, а не только текст ошибки.
   - Важно доказать, что клиентский путь больше не тянет insecure Web Crypto dependency.

3. Если часть функциональности действительно требует secure context, это должно быть оформлено как явная диагностика.
   - Runtime crash недопустим даже при ограниченном окружении.

## Risks / Trade-offs

- Можно починить только видимый import-path и пропустить другой косвенный клиентский путь.
- Можно скрыть ошибку, но не исправить сам boundary.
- Browser-level симптом может иметь вторичную связь с Monaco, поэтому нужен фокус именно на первичном Web Crypto path.

## Open Questions

- Достаточно ли unit/source-contract guard, или потребуется targeted browser regression.
- Нужна ли отдельная help-диагностика про insecure context после устранения crash.

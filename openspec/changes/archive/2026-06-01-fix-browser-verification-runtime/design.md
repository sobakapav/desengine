## Context

Текущий тестовый слой уже декларирует `test:e2e`, внешний серверный режим и browser smoke, но operational contract для этих сценариев недостаточно жёсткий. На практике это выражается в двух типах сбоев:

1. server-startup failure:
   - Playwright `webServer` не может поднять локальный Next target в конкретной среде;
   - downstream e2e даже не доходят до runtime приложения.

2. browser-runtime failure:
   - target server уже доступен, но Chromium не стартует или падает до начала сценария;
   - тестовый verdict не говорит ничего о состоянии продукта.

Из-за этого одна и та же `test:e2e` команда в одних случаях проверяет продукт, а в других только случайность окружения.

## Decisions

1. Browser verification должна стать двухступенчатой.

   Сначала выполняется browser verification preflight:
   - managed `webServer` сначала подтверждает процессную готовность через лёгкий readiness route;
   - затем preflight отдельно проверяет, что `/auth` доступен по ожидаемому base URL;
   - выбранный режим запуска (`webServer` или external server) явно отражён в диагностике;
   - Playwright способен запустить Chromium и открыть минимальный route;
   - при failure причина классифицируется как infra/runtime verification issue, а не как product regression.

   Только после успешного preflight downstream browser-spec считается валидным источником product verdict.

2. External server path становится каноническим fallback, а не неформальным обходным манёвром.

   Если среда не допускает штатный bind встроенного `webServer`, система должна:
   - явно принимать `DESENGINE_E2E_EXTERNAL_SERVER=1`;
   - требовать `DESENGINE_E2E_BASE_URL`;
   - печатать понятный diagnostics path, если внешний сервер не отвечает или указывает на неверный target.

3. Browser verification smoke должен проверять именно инфраструктурную готовность.

   Такой smoke не должен зависеть от конкретного UX-fix. Он должен отвечать только на вопрос: можно ли доверять последующим browser verdicts.

4. Закрытие downstream browser-fix changes зависит от валидности verification path.

   Если preflight/smoke не проходит по infra-причине, downstream `fix-*` нельзя закрывать на основании несостоявшейся browser-проверки.

## Implementation Outline

- Уточнить contract `playwright.e2e.config.ts` и/или общий test runner так, чтобы режим запуска браузерной проверки был детерминированным и диагностируемым.
- Для verification_command самого fix-change разрешить изолированный wrapper, который поднимает target server вне lifecycle Playwright `webServer`, если managed bind в среде верификации нестабилен.
- Добавить отдельный browser verification smoke/preflight spec или equivalent automation-path.
- Уточнить `docs/testing-layer.md` и `test/README.md`, чтобы режимы `webServer` и `external server` были не просто перечислены, а описаны как канонические verification modes.
- Добавить unit/static guardrails на конфиг browser verification, если критичные env-ветки и diagnostics можно проверить без живого браузера.

## Risks / Trade-offs

- [Риск] Исправление сведётся к документации без реального infra smoke.
  - Mitigation: считать change незавершённым без runnable browser verification path.

- [Риск] Команда попытается “стабилизировать” проверку выключением строгих browser assertions.
  - Mitigation: отдельно зафиксировать, что infra smoke и product assertions не взаимозаменяемы.

- [Риск] Смешаются обязанности test-system fix и конкретных product fixes.
  - Mitigation: этот change отвечает только за пригодность verification pipeline, а не за устранение конкретных UX/runtime дефектов.

## Open Questions

- Должен ли preflight жить как отдельный `test/e2e/browser-verification-runtime.spec.ts` или как общий harness-путь до продуктовых spec-файлов.
- Нужен ли отдельный source-contract на запрет ложного успеха, когда `test:e2e` завершается без валидного browser target.

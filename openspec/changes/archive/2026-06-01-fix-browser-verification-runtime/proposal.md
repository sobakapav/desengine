## Why

Browser-level проверка сейчас не даёт надёжного ответа, сломано ли пользовательское поведение или сама инфраструктура верификации:

- встроенный `webServer` в `playwright.e2e.config.ts` может падать на `listen EPERM 127.0.0.1:3410`;
- запуск Chromium через Playwright в части сред падает на `browserType.launch ... SIGABRT` и оставляет `kill EPERM`;
- product fixes, которым нужна честная browser-приёмка, зависают между двумя состояниями: unit уже зелёный, а browser verdict нельзя считать валидным;
- у команды нет отдельного контрактного пути, который бы доказывал: сервер поднят, браузер стартует, базовый route smoke жив, а дальше уже можно принимать или отвергать конкретный UX/runtime fix.

Без отдельного исправления тестовой подсистемы downstream browser-fixes либо закрываются на слабых основаниях, либо бесконечно висят из-за инфраструктурного шума.

## What Changes

- Ввести явный browser-verification contract для обязательных Playwright/e2e проверок.
- Развести два режима запуска:
  - встроенный `webServer`, если среда действительно допускает bind и локальный подъём сервера;
  - канонический внешний verification path через `DESENGINE_E2E_EXTERNAL_SERVER=1` и `DESENGINE_E2E_BASE_URL=...`, если встроенный путь ненадёжен.
- Добавить preflight/smoke слой, который отдельно отвечает на вопросы:
  - можно ли поднять и использовать target server;
  - может ли Playwright реально запустить Chromium;
  - доступен ли базовый browser route до начала продуктовых e2e.
- Зафиксировать user- and maintainer-facing диагностику так, чтобы infra failure не маскировался под product bug и наоборот.
- Связать browser verification с traceability и правилами закрытия downstream `fix-*`, которым нужна внешняя browser-приёмка.

## Non-goals

- Не исправлять конкретные продуктовые browser-баги вроде `iterate-timeout-feedback` или `workbench-context-visibility`.
- Не менять install-critical стек, `Node.js`, Next.js, Turbopack или сам браузерный движок без отдельного change и явного разрешения.
- Не ослаблять product-level browser-contract ради формального зелёного теста.
- Не подменять живую browser-проверку только unit- или static-слоем.

## Impact

- У browser-fix changes появится честный verification path, на который можно опираться при внешней приёмке.
- Инфраструктурные падения Playwright/server startup перестанут смешиваться с дефектами пользовательского поведения.
- `dispatcher-test-system` получит отдельный fix на стабилизацию browser-проверки, вместо размывания этой работы по чужим runtime changes.

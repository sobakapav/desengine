## Миссия

- Что должен изменить этот change: превратить browser verification из нестабильного окруженческого факта в явный и воспроизводимый test-system contract, по которому можно честно принимать или блокировать downstream browser-fix changes.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-test-system` уже отделил test runtime/tooling от продуктовых fixes и требует, чтобы browser-проверка была частью управляемой тестовой подсистемы, а не импровизацией в каждом downstream change.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-test-system`; этот fix отвечает за browser verification pipeline, diagnostics и runnable preflight/smoke-контур.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/specs/testing-layer/spec.md
- docs/testing-layer.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-browser-verification-runtime: `test/README.md`, `playwright.e2e.config.ts`, `test/e2e/route-smoke.spec.ts`, `test/e2e/sandpack-preview-style-runtime.spec.ts`, `openspec/changes/fix-sandpack-tailwind-preview-pipeline/handoff.md`, `openspec/changes/fix-iterate-timeout-feedback/proposal.md`, `openspec/changes/fix-workbench-context-visibility/proposal.md`.

## Границы исполнения

- Что входит в этот change: deterministic browser verification modes, явный external-server contract, runnable preflight/smoke, diagnostics для bind/launch/base-url failures и правила, по которым downstream browser-fixes можно либо принимать, либо блокировать.
- Что сознательно не входит в этот change: устранение конкретных UX/runtime дефектов в workbench, iterate, preview, Sandpack и других продуктовых flows; замена Playwright; изменение install-critical стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: browser-приёмка как требование для части fixes уже принята; этот change не имеет права ослаблять её до unit-only или ручного “примерно работает”.

## Проверка результата

- verification_level: component/browser
- verification_command: `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`
- Что именно должен доказать результат проверки: среда browser verification пригодна для product verdict; при infra failure система выдаёт понятную классификацию проблемы, а при готовой среде downstream browser-spec действительно проверяет продукт, а не падает из-за запуска Chromium или bind webServer.

## Root Cause

- Сейчас один и тот же e2e-путь смешивает product и infra verdict. Когда `webServer` падает на `EPERM`, а Chromium — на `SIGABRT`, downstream bugfix получает “browser fail”, который не говорит ничего о продукте.
- В результате часть product fixes остаётся незакрытой не потому, что дефект жив, а потому что verification pipeline сам не стал предметом отдельного исправления.
- Пока browser verification не выделен в самостоятельный fix change, команда вынуждена либо закрывать browser-fixes на слабых основаниях, либо бесконечно спорить о качестве окружения вместо исправления контрактов.

## Что должно получиться

- Browser verification имеет штатный и fallback path, оба документированы и проверяемы.
- Есть runnable preflight/smoke, который можно запускать до продуктовых e2e.
- Downstream fixes с обязательной browser-приёмкой закрываются только после валидного preflight и осмысленного product verdict.
- Для `fix` с `verification_level=component/browser` невалидный preflight блокирует `npm run os:close -- <change>`.
- Общесистемный managed `webServer` path остаётся штатным для обычных browser/e2e проверок, а verification_command этого change использует изолированный wrapper `tools/testing/run-browser-verification-runtime.mjs`, который поднимает внешний target server вне Playwright `webServer`, дожидается readiness и затем запускает spec в `external-server verification`.
- Для `external-server verification` target-server preflight вынесен в прямой shell-level `curl` к `/auth`, потому что сам Node/Playwright worker в части сред не имеет localhost transport и не может честно мерить доступность target server изнутри spec.

## Реализовано в коде

- Общий runtime contract browser verification собран в `test/helpers/browser-verification.ts` и подключён в `playwright.e2e.config.ts`.
- Для managed path `playwright.e2e.config.ts` ждёт readiness route `/api/status/llm`, а preflight в `test/e2e/browser-verification-runtime.spec.ts` отдельно проверяет `HTTP 200` от `/auth` перед browser-step.
- `tools/testing/run-browser-verification-runtime.mjs` поднимает изолированный `next dev`, ждёт readiness route и затем запускает shell preflight плюс сам browser verification spec во внешнем режиме, чтобы `os:close` этого change не зависел от нестабильного lifecycle Playwright `webServer`.
- Для external path shell probe `tools/testing/browser-target-preflight.mjs` остаётся отдельной проверкой target server, а запуск Chromium и открытие `/auth` диагностируются как самостоятельные этапы.
- `test/README.md` и `docs/testing-layer.md` закрепляют правило, что unit/static green не заменяет валидный browser verdict для downstream fixes.
- `route-smoke` сохраняет guard на нежелательные мутации `user/`, но больше не шумит из-за одних только `mtimeMs` после browser-crash.
- Workbench preview читает active project из browser storage на первом рендере и показывает bounded fetch error вместо бесконечного `Загрузка рендера…`, чтобы downstream browser-verdict зависел от реального runtime, а не от race начальной гидратации.

## Blocker cases

- `fix-sandpack-tailwind-preview-pipeline` требует browser verdict для style contract внутри iframe и не может считаться принятым только по unit/static.
- `fix-iterate-timeout-feedback` требует browser verdict для снятия pending и user-facing recovery path, даже если unit/runtime слой уже зелёный.
- `fix-workbench-context-visibility` требует browser verdict для layout-level видимости контекста и новых файлов, а не только source-level уверенности.

## Открытые вопросы

- Нужен ли отдельный `test/unit` или `test:spec` guardrail на конфиг Playwright/env-routing, чтобы случайный возврат к невалидной схеме обнаруживался без живого браузера.
- Стоит ли печатать user-facing diagnostics прямо в output `test:e2e`, если выбран неподходящий verification mode для текущей среды.

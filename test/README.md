# Тестовый слой

Этот каталог содержит автоматизированный тестовый слой desengine. Он нужен для проверки изменений человеком через понятные команды, а не для ручного кликанья по приложению.

Основной подробный документ: `docs/testing-layer.md`.

## Что запускать

Перед небольшой правкой:

```bash
npm test
```

Перед закрытием change:

```bash
npm run test:full
```

Сейчас `test:full` запускает:

```bash
npm run test:unit
npm run test:traceability
npm run quality:text
```

Браузерный smoke запускается отдельно:

```bash
npm run test:e2e
```

Targeted smoke переключения UI kit использует fixture-доступ без live allowlist:

```bash
DESENGINE_E2E_FIXTURE_ACCESS=1 npm run test:e2e -- test/e2e/project-ui-kit-switching.spec.ts
```

Live/provider-проверки не входят в обычный обязательный прогон и запускаются только явно:

```bash
npm run test:live
```

Сейчас эта команда проверяет только локальную готовность env активного provider. Если обязательной переменной не хватает, preflight завершится с кодом `1`, перечислит недостающие имена и не покажет секретные значения.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm test` | Быстрый локальный прогон, сейчас alias на `test:unit`. |
| `npm run test:unit` | Unit/source-contract проверки в `test/unit/**/*.test.ts`. |
| `npm run test:traceability` | Проверка связи `@openSpec` metadata с `openspec/specs/**`. |
| `npm run quality:text` | Проверка подсистемы code-quality-text по рабочим изменениям. |
| `npm run quality:text:branch` | Проверка подсистемы code-quality-text по изменениям ветки. |
| `npm run quality:text:repo` | Полная проверка подсистемы code-quality-text по репозиторию. |
| `npm run test:full` | Обязательный слой текущего этапа: unit + traceability + code-quality-text. |
| `npm run test:storybook` | Browser/component проверки Storybook; пока успешно проходит без story-файлов. |
| `npm run test:e2e` | Playwright route smoke без live credentials. |
| `npm run test:integration` | Integration-проверки route/API-flow в `test/integration/**/*.test.ts`. |
| `npm run test:live` | Env-aware preflight для активного provider без реальных сетевых вызовов. |
| `npm run test:spec -- <capability>` | Зарезервировано для выборочного запуска по OpenSpec capability. |

## Структура

- `unit/` — быстрые unit и source-contract тесты.
- `integration/` — route/API boundary без браузера и live credentials.
- `e2e/` — короткие Playwright smoke-сценарии критичных маршрутов.
- `fixtures/` — детерминированные данные для тестов.
- `helpers/` — общие тестовые helper-функции.
- `shims/` — тестовые замены runtime-only модулей.
- `traceability/` — карта покрытия OpenSpec и migration coverage-plan.

## Unit

Unit-тесты запускаются командой:

```bash
npm run test:unit
```

Для выборочного запуска можно передать фильтр Vitest:

```bash
npm run test:unit -- -t "часть названия"
```

Новые быстрые проверки доменной логики, server-логики и source-contract инвариантов добавляй в `test/unit/**/*.test.ts`.

## Traceability OpenSpec

Если тест покрывает OpenSpec-сценарий, добавь metadata в начало файла:

```ts
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Конфигурация выбрала Google Gemini"
```

Правила:

- `capability` должен совпадать с каталогом `openspec/specs/<capability>/spec.md`.
- scenario должен точно совпадать с заголовком `#### Scenario:` в spec.
- Один файл может содержать несколько блоков `@openSpec capability`.
- Если capability временно покрыт не полностью, он должен быть описан в `test/traceability/coverage-plan.json`.

Проверка:

```bash
npm run test:traceability
```

## Integration

Integration-тесты запускаются командой:

```bash
npm run test:integration
```

Новые проверки route/API boundary добавляй в `test/integration/**/*.test.ts`.

Этот слой:

- импортирует реальные route handlers напрямую;
- не поднимает `next dev` и не использует браузер;
- подменяет runtime/service зависимости stub- и fixture-boundary;
- не должен требовать live credentials и не должен писать в рабочий `user/`.

## Code Quality Text

Быстрая проверка рабочих изменений:

```bash
npm run quality:text
```

Проверка изменений всей ветки:

```bash
npm run quality:text:branch
```

Полный аудит всего репозитория:

```bash
npm run quality:text:repo
```

Что проверяется автоматически:

- лимит строк кода в файле (production: 300, test/storybook: 450);
- лимит строк кода в функции (60);
- запрет boolean-trap параметров в экспортируемых API;
- запрет floating promises без `await`, `void` или `catch/finally`;
- формат временных пометок `TODO/FIXME`.

Формат временной пометки:

```ts
// TODO(owner:team-desengine, targetStage:5.4): вынести адаптер хранения
```

Если legacy-нарушение временно не закрывается, его можно зафиксировать в:

- `tools/quality-text/waivers.json`

Для waiver обязательны поля `rules`, `owner`, `reason`, `targetStage`.
Отчёт показывает `Scope`, `Files checked`, `Violations`, `Waived violations` и `LLM mode`.
Optional LLM-режим выключен по умолчанию, не входит в `test:full` и при ручном включении должен сработать только внутри budget caps или вернуться к `fallback:deterministic`.

Совместимые алиасы migration-этапа:

- `npm run test:readability`
- `npm run test:readability:branch`
- `npm run test:readability:repo`

## E2E smoke

E2E запускается через `playwright.e2e.config.ts`:

```bash
npm run test:e2e
```

Команда стартует отдельный `next dev` на `127.0.0.1:3410`, очищает live/provider env для тестового процесса и не требует реальных LLM ключей, allowlist-хранилища или `ONBOARDING_REPO_URL`.

По умолчанию используется bundled Chromium:

```bash
PLAYWRIGHT_BROWSER_CHANNEL=chromium npm run test:e2e
```

Если нужно использовать уже запущенный dev-server:

```bash
DESENGINE_E2E_EXTERNAL_SERVER=1 DESENGINE_E2E_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

Внешний режим считается каноническим fallback для browser verification. Он требует явный `DESENGINE_E2E_BASE_URL`; молчаливый fallback на localhost в этом режиме запрещён.

Канонический browser verification path для Codex `CODEX_SANDBOX=seatbelt` и других нестабильных execution mode:

```bash
node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts
```

Этот wrapper:

- сначала пытается переиспользовать уже живой target server через `DESENGINE_E2E_BASE_URL` или стандартный localhost-port browser/e2e;
- если подходящего живого target server нет, поднимает изолированный `next dev` напрямую через `node_modules/.bin/next`;
- выполняет shell-level preflight до Playwright worker;
- запускает browser spec во внешнем режиме;
- форсирует `DESENGINE_E2E_RUNNER=browser-wrapper` и стабильный канал `PLAYWRIGHT_BROWSER_CHANNEL=chromium`.

Прямой `npm run test:e2e` в Codex seatbelt не должен использоваться как browser verification verdict: конфиг прерывает такой запуск сразу с инструкцией перейти на wrapper, чтобы не получать повторяющийся ложный `SIGABRT`/`kill EPERM`.

Preflight browser verification запускается отдельно:

```bash
DESENGINE_E2E_EXTERNAL_SERVER=1 DESENGINE_E2E_BASE_URL=http://127.0.0.1:3410 npm run test:e2e -- test/e2e/browser-verification-runtime.spec.ts
```

Он разделяет две проверки:

- target server действительно отвечает;
- Chromium реально открывает базовый route.

В managed-режиме Playwright сначала дожидается лёгкого readiness route `/api/status/llm`, а затем сам preflight отдельно проверяет `HTTP 200` от `/auth`. Так route-level проблема не маскируется под долгий старт `webServer`.

Для `external-server verification` shell-level проверка target server должна идти отдельно, вне Playwright worker:

```bash
curl -fsS -o /dev/null -w '%{http_code}' --max-time 15 http://127.0.0.1:3410/auth | grep -qx '200'
DESENGINE_E2E_EXTERNAL_SERVER=1 DESENGINE_E2E_BASE_URL=http://127.0.0.1:3410 npm run test:e2e -- test/e2e/browser-verification-runtime.spec.ts
```

Это нужно потому, что в части сред сам test process может не иметь localhost transport, даже если внешний shell `curl` видит `HTTP 200`. Но внутри Codex seatbelt even после этого preflight browser verdict должен идти через wrapper, а не через прямой `npm run test:e2e`.

Если preflight невалиден, downstream browser-fix нельзя считать принятым только по unit/static результатам.

Текущий route smoke:

- `/auth` и `/system` открываются без допуска;
- `/` без допуска переводит на `/auth`;
- `/tasks`, `/levels`, task entry и level entry перечислены в наборе, но временно skipped до стабилизации параллельного runtime-переезда task/user schema.

E2E helper делает snapshot каталога `user/` до и после активных сценариев. Если smoke меняет пользовательское состояние, тест должен упасть.

## Fixtures и credentials

Обычные команды `npm test`, `npm run test:unit`, `npm run test:full` и `npm run test:e2e` не должны требовать live credentials.

Секреты нельзя хранить в git. Для live/provider-проверок использовать только env или локальные некоммитимые файлы.

Переменные для live preflight:

- OpenAI: `LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`.
- DeepSeek: `LLM_PROVIDER`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`.
- Google Gemini: `LLM_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_BASE_URL`.
- Claude: `LLM_PROVIDER`, `CLAUDE_API_KEY`, `CLAUDE_MODEL`, `CLAUDE_BASE_URL`, `CLAUDE_MAX_TOKENS`.
- Z.AI: `LLM_PROVIDER`, `ZAI_API_KEY`, `ZAI_MODEL`, `ZAI_BASE_URL`.
- Allowlist: `ALLOWLIST_BASE_URL`, `ALLOWLIST_SALT`.
- Onboarding: `ONBOARDING_REPO_URL`.

## Как добавлять тест для change

Каждый behavior-change должен иметь тестовую часть в OpenSpec tasks:

- затронутые capability/scenarios;
- уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider;
- команда запуска;
- mock/fixture-данные;
- live credentials, если они нужны;
- запись в `test/traceability/coverage-plan.json`, если покрытие откладывается.

Новый change, созданный через `npm run openspec:new -- <name>`, автоматически получает базовый тестовый чеклист в `tasks.md`.

Минимальный пример:

```md
## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: unit
- [ ] Добавить unit-тест в `test/unit/example.test.ts`
- [ ] Зафиксировать команду проверки: `npm run test:unit -- example.test.ts`
- [ ] Описать mock/fixture-данные: используются локальные fixtures, live credentials не нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия
```

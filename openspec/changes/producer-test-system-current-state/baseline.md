# Baseline: Test System Current State

## Объём исследования

Исследование собрано по фактическим артефактам репозитория на 2026-05-24:

- `package.json` и канонические test-команды;
- `docs/testing-layer.md` и `test/README.md`;
- `test/**`, `tools/testing/**`, `playwright.e2e.config.ts`, `vitest.config.ts`;
- `test/traceability/spec-coverage-map.json` и `test/traceability/coverage-plan.json`;
- активные OpenSpec specs в `openspec/specs/**`.

## Текущее состояние слоя

### Реально runnable сейчас

- `npm test` и `npm run test:unit`: основной быстрый контур на Vitest `unit`.
- `npm run test:traceability`: реальный checker metadata и OpenSpec-сценариев, но сейчас в слое есть как минимум один активный разрыв.
- `npm run test:e2e`: частично runnable Playwright smoke без live credentials.
- `npm run test:full`: unit + traceability + code-quality-text.
- `npm run quality:text*`: отдельный runnable quality-контур.

### Формально есть, но по сути ещё не реализовано

- `npm run test:integration`: placeholder через `tools/testing/pending-layer.mjs`.
- `npm run test:live`: placeholder через `tools/testing/pending-layer.mjs`.
- `npm run test:spec -- <capability>`: placeholder через `tools/testing/pending-layer.mjs`.
- `npm run test:storybook`: точка входа есть, но в репозитории сейчас `0` story-файлов, поэтому команда не доказывает реальное component/browser покрытие.

## Ключевые findings

### P0. Traceability-контур сейчас не зелёный

- `tools/testing/traceability/report.mjs` на текущем дереве возвращает `errorCount = 1`.
- Активная ошибка: `test/unit/openspec-handoff.test.ts (admin-tools) ссылается на неизвестный scenario: Диспетчеризация хотелки выполняется одной командой`.
- Это означает, что `npm run test:traceability` сейчас не является надёжным quality gate без точечного fix.

### P0. Карта покрытия отстаёт от реального набора capability

- В `openspec/specs/**` сейчас `33` активных capability.
- В `test/traceability/spec-coverage-map.json` описаны только `26`.
- Из карты выпали действующие capability:
  - `artifacts`
  - `code-readability`
  - `image-inspector`
  - `prompt-context`
  - `task-model`
  - `workbench`
  - `workflow`
- Следствие: traceability checker валидирует metadata по specs, но сама приоритетная карта покрытия уже не описывает весь активный контракт системы.

### P1. E2E smoke остаётся частичным и местами расходится с документами

- В `test/e2e/fixtures/smoke-fixture.ts` защищённые маршруты `/tasks`, `/levels`, `/tasks/e2e-fixture-task` и `/levels/e2e-fixture-level` всё ещё `skip` с причиной про незавершённый runtime-переезд `task/user schema`.
- Документация (`docs/testing-layer.md`, `test/README.md`) говорит о публичном smoke для `/auth` и `/system`, но текущий fixture-набор использует `/auth` и `/config`.
- `test/e2e/route-smoke.spec.ts` вообще не содержит `@openSpec` metadata, хотя покрывает contract-sensitive маршруты и help asset guard.

### P1. Live/provider и capability-runner остаются обещаниями, а не инструментом

- `test:live` и `test:spec` завершаются успешно как placeholders.
- При этом `openspec/specs/testing-layer/spec.md` уже требует для live/provider запуска чтение credentials из env и понятную диагностику отсутствующих переменных.
- В репозитории уже есть подготовительный helper `test/helpers/test-env.ts`, но CLI-точка `test:live` ещё не использует этот контур.

### P1. Component/browser слой инфраструктурно заявлен, но контентно пуст

- `vitest.config.ts` содержит отдельный `storybook` project.
- Фактических `.stories.*` файлов в репозитории сейчас нет.
- Это значит, что стабильная точка входа есть, но доказанного browser/component слоя по active specs пока нет.

### P2. Не все существующие тесты встроены в OpenSpec traceability

- Всего найдено `58` test/spec-файлов в `test/**`.
- `52` из них содержат `@openSpec capability`.
- Без metadata остаются:
  - `test/e2e/route-smoke.spec.ts`
  - `test/unit/check-prompt-context.test.ts`
  - `test/unit/editor-shortcuts.test.ts`
  - `test/unit/onboarding-prompt-templates.test.ts`
  - `test/unit/prompt-render.test.ts`
  - `test/unit/test-env.test.ts`
- Часть из них очевидно мапится на существующие capability (`prompt-context`, `testing-layer`, `access-control`), но часть требует отдельного решения по ownership и границам контракта.

### P2. Coverage-plan остаётся узким, но показательным списком долгов

- `navigation`: `3/4` сценария, follow-up на левую часть Navigation и canonical labels.
- `ui-foundation`: `3/4` сценария, follow-up на browser/component контракт навигации.
- `code-readability`: `0/21` сценарий, пока нет отдельного полного `@openSpec`-набора на capability.

## Что в системе уже хорошо

- Базовый unit-контур большой и не декоративный: `54` unit-файла.
- E2E слой изолирует live/provider env и контролирует побочные эффекты через snapshot `user/`.
- Foundation event-линия уже имеет reusable harness и отдельные unit/source-contract тесты.
- Репозиторий системно требует тестовую часть в OpenSpec changes, и это уже влияет на качество постановок.

## Приоритетные действия

### Однозначный dispatcher найден

- `dispatcher-test-system`
  - Нужен fix на полноту `spec-coverage-map.json` относительно активных specs.
  - Нужен implement на замену placeholder `test:live` минимальным env-aware preflight.
  - Нужен implement на замену placeholder `test:integration` реальным runner'ом server/API-flow.

### Нужны дальше, но без немедленного child change здесь

- Реальный `test:spec` runner по capability.
- Нормализация traceability metadata для части существующих unit/e2e тестов.

## Рекомендуемая реализация `test:integration`

### Что именно должен проверять этот слой

- Не браузер и не `next dev`, а прямую склейку `route handler -> auth/body/params -> runtime/service boundary -> HTTP response`.
- Только server/API-flow, который уже слишком широк для unit, но ещё не требует e2e.
- Только детерминированный fixture/mock/temp-state контур без live provider credentials и без реальных сетевых вызовов.

### Как лучше всего реализовать runner

- Отдельный Vitest project `integration` в `node`-окружении.
- Каноническая команда: `npm run test:integration`.
- Shared helpers:
  - вызов `app/api/**/route.ts` с `Request` и async `params`;
  - safe JSON/HTTP assertions поверх `Response`;
  - fixture env setup;
  - temp user-state или stubbed storage boundary для route, которые пишут файлы и progress.
- `test:full` на первом шаге не менять: integration должен стабилизироваться отдельно, а не стать обязательным gate раньше времени.

### Приоритет первой волны

- `task` route handlers:
  - `GET /api/tasks/[taskId]`
  - `POST /api/tasks/[taskId]/start`
  - `POST /api/tasks/[taskId]/iterate`
  - `POST /api/tasks/[taskId]/check`
  - `POST /api/tasks/[taskId]/reset`
  - при необходимости `POST /api/tasks/[taskId]/files`
- Support routes с уже явной spec-traceability:
  - `GET /api/status/llm`
  - `POST /api/onboarding/update`

### Что сознательно не смешивать с первой волной

- browser smoke и route rendering;
- реальные provider/live вызовы;
- автоматическое включение integration в `test:full`;
- отдельную route-wave для `auth/verify` и `/api/system/update`, пока не решено, как лучше оформить их contract-traceability без искусственного расширения текущего объёма.

## Где dispatcher пока неочевиден

- Разблокировка skipped smoke по `/tasks` и `/levels` зависит не только от тестового слоя, но и от незавершённого runtime-переезда `task/user schema`. Здесь ownership может лежать между `dispatcher-test-system`, runtime-контуром и UX-контуром.
- Наполнение Storybook/component слоя нельзя честно отдать одному dispatcher-test-system: сам harness его зона ответственности, но содержательное покрытие должно идти через доменные dispatcher'ы (`dispatcher-ux`, `dispatcher-image-inspector` и другие feature/runtime-контуры).
- Для `test/unit/editor-shortcuts.test.ts` пока нет очевидного capability с прямым сценарием про hotkey; прежде чем создавать child change, нужно решить, это runtime-contract `level-labs`, отдельный editor contract или просто локальный unit-инвариант без OpenSpec-связи.

## Созданные downstream changes

- `fix-test-spec-coverage-map-completeness`
- `implement-live-provider-test-preflight`
- `implement-integration-test-runner-foundation`
- `implement-route-integration-fixture-wave`

## Уточнение по traceability-разрыву `openspec-handoff`

Первичный baseline зафиксировал active error в `admin-tools` traceability. При последующей реализации выяснилось, что сам mismatch уже устранён в текущем дереве независимым изменением, поэтому отдельный downstream change под этот разрыв не retained как полезная новая работа.

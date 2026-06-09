# Release Notes

Релиз закрыт 2026-06-09.

Этот файл вёлся по мере готовности и закрытия changes из релиза и теперь фиксирует итоговый состав quality-волны.

Для каждого сделанного change сюда добавляется простое описание:

- что меняется для пользователя;
- как это влияет на пользователя;
- как вручную или через понятную команду убедиться, что change действительно доехал.

## Состав релиза

- `implement-workbench-preview-payload-budgeting`
- `implement-runtime-task-load-guardrails`
- `implement-runtime-llm-payload-budgets`
- `implement-test-performance-budget-verdicts`
- `implement-test-speed-load-regression-harness`
- `implement-runtime-speed-observability`
- `fix-browser-webcrypto-insecure-context`
- `fix-monaco-cancellation-noise`
- `fix-preview-radix-slot-runtime`
- `fix-preview-contract-review-gaps`
- `implement-test-real-onboarding-smoke-contract`
- `fix-release-notes-close-sync`
- `fix-release-close-active-members-guard`
- `fix-release-members-kind`
- `fix-release-link-sync`

## Смысл волны

Это quality-релиз, который объединяет speed/load-срез `producer-speed-and-load`, preview/runtime hardening, тестовый контракт и release-tooling качества:

- ускорение preview/workbench payload pipeline;
- bounded guardrail'ы на task action runtime;
- budget'ы на LLM payload, structured-output и write-set.
- performance budget verdicts в тестовом слое;
- reusable regression harness для speed/load сценариев;
- structured runtime observability для локализации regressions и guardrail-срабатываний.
- устранение drift-проблем в preview dependency graph;
- закрытие review-разрывов в preview runtime, browser evidence и storage-контракте UI kit;
- отдельный smoke-контракт для реального onboarding checkout;
- синхронизация release notes и релизного lifecycle.
- защита от ошибочного закрытия release с незакрытым активным составом.
- жёсткий запрет на non-executable members в release composition.
- полная синхронизация `release_ref` между metadata и handoff при release-dispatch.

## Итог закрытия

- Все `implement` и `fix` changes этого релиза закрыты и выведены из active-слоя.
- В active-составе больше не осталось downstream changes с `release_ref=release-2026-06-02-quality`.
- Релиз завершён как under-the-hood quality-срез: preview/runtime hardening, performance/test guardrail'ы, real-onboarding smoke и release-tooling качества.

## Уже сделано

### `implement-test-performance-budget-verdicts`

- Что меняется для пользователя: команда теперь раньше замечает, что ключевые действия в лаборатории начали ощутимо тормозить, и может остановить такую деградацию до релиза.
- Как это влияет на пользователя: меньше шанс, что после обычной правки `start`, `iterate`, `check` или вход в лабораторию станут заметно медленнее без предупреждения.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/performance-budget-verdicts.test.ts`.
  2. Убедиться, что проверка различает нормальную скорость, заметную деградацию и выход за budget для `preview payload build`, `start`, `iterate`, `check` и `lab/task entry path`.
  3. При желании открыть `test/unit/performance-budget-verdicts.test.ts` и увидеть, что одиночный шумовой spike не считается регрессией сам по себе.

### `implement-runtime-speed-observability`

- Что меняется для пользователя: если лаборатория начинает тормозить или вести себя нестабильно в `start`, `iterate`, `check` или preview, теперь у команды есть гораздо более понятная диагностика, где именно возникла проблема.
- Как это влияет на пользователя: ошибки и замедления в ключевых шагах проще локализовать, поэтому меньше шанс, что деградация останется «непонятным торможением» без причины и будет дольше мешать работе.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/task-actions-boundary.test.ts test/unit/sandpack-preview.test.ts`.
  2. Убедиться, что проверки читают `runtimeDiagnostics` для `start`, `iterate`, `check`, `mutation_boundary` и `preview_payload_build`.
  3. При желании открыть `test/unit/task-actions-boundary.test.ts` и `test/unit/sandpack-preview.test.ts` и увидеть, что diagnostics содержат `durationMs`, status, size/load поля и сигналы degradation.

### `fix-browser-webcrypto-insecure-context`

- Что меняется для пользователя: если браузерное окружение не даёт native `secure Web Crypto`, preview теперь сначала пытается подняться через локальный fallback вместо немедленного падения.
- Как это влияет на пользователя: в обычном dev/onboarding-окружении Sandpack preview должен продолжать открываться без `crypto.subtle.digest` crash. Понятное сообщение показывается только если даже fallback не удалось установить.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/browser-webcrypto-runtime-boundary.test.ts`.
  2. Убедиться, что preview-path сначала пытается установить локальный `digest`-fallback для Sandpack до отказа от `preview`.
  3. При ручной проверке открыть лабораторию в insecure окружении и убедиться, что preview продолжает загружаться без `crypto.subtle.digest` crash. Notice показывается только если fallback действительно не удалось поставить.

### `fix-monaco-cancellation-noise`

- Что меняется для пользователя: лаборатория спокойнее обрабатывает штатные внутренние отмены Monaco и не смешивает их с настоящими ошибками редактора.
- Как это влияет на пользователя: меньше ложного runtime-шума вокруг Monaco и меньше риска принять внутреннюю отмену редактора за поломку пользовательского сценария. Если единичные cancellation-логи ещё встречаются в отдельных окружениях, они не должны ломать сам редактор.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/monaco-cancellation-noise.test.ts test/unit/p1-source-contracts.test.ts`.
  2. Убедиться, что фильтр принимает Monaco cancellation-shape и не подавляет посторонние rejection-ошибки.
  3. При ручной проверке открыть лабораторию, переключить файлы или перезагрузить экран и убедиться, что редактор остаётся рабочим, а cancellation-шум не влияет на пользовательский сценарий.

### `implement-test-speed-load-regression-harness`

- Что меняется для пользователя: команда получила единый способ воспроизводить speed/load-сценарии лаборатории, а не собирать каждый такой тест заново вручную.
- Как это влияет на пользователя: меньше шанс, что деградации в cold/warm preview, repeated `iterate`/`check`, backlog очереди или oversized refusal останутся незамеченными до релиза.
- Как проверить:
  1. Запустить `npm run test:integration`.
  2. Убедиться, что `test/integration/speed-load-regression-harness.test.ts` проходит сценарии cold/warm preview, repeated rebuild, repeated `iterate`/`check`, overload backlog и oversized refusal на fixture/stub runtime.
  3. Дополнительно запустить `npm run test:traceability` и убедиться, что сценарии harness привязаны к capability `testing-layer`.

### `implement-workbench-preview-payload-budgeting`

- Что меняется для пользователя: preview в лаборатории меньше тратит лишние ресурсы на повторные сборки, повторно использует тяжёлые промежуточные результаты и не пытается без границ прожёвывать слишком тяжёлый payload.
- Как это влияет на пользователя: preview должен быстрее оживать на повторных открытиях и обновлениях, а в перегруженных сценариях вместо бесконтрольного торможения или раздувания памяти пользователь получает безопасный fallback с понятной диагностикой.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/sandpack-preview.test.ts test/unit/project-ui-kit-switching.test.ts`.
  2. Убедиться, что диагностика preview различает reuse derived artifacts, CSS cache path и budget-degraded ветки.
  3. При ручной проверке открыть лабораторию, несколько раз обновить preview и убедиться, что повторный путь работает стабильнее, а при искусственно тяжёлом preview система уходит в безопасный fallback вместо зависания.

### `implement-runtime-task-load-guardrails`

- Что меняется для пользователя: если по одной задаче слишком быстро накапливаются `start`, `iterate`, `check`, `save` или `reset`, система теперь не раздувает очередь бесконечно, а быстро отвечает retriable overload-ошибкой.
- Как это влияет на пользователя: меньше шанс, что лаборатория подвиснет из-за накопленной очереди действий. Вместо неясного ожидания пользователь получает понятный временный отказ и может повторить действие позже.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/task-mutation-boundary.test.ts test/unit/task-actions-boundary.test.ts`.
  2. Запустить `npm run test:integration -- test/integration/task-routes.test.ts`.
  3. Убедиться, что overload-path возвращает `503`, `errorKind: "overload"`, `retryable: true` и runtime diagnostics без частично применённой мутации.

### `implement-runtime-llm-payload-budgets`

- Что меняется для пользователя: слишком тяжёлые `start`, `iterate` и `check` теперь останавливаются по явному runtime budget до дорогих вызовов и до записи файлов, а не проваливаются глубже по цепочке.
- Как это влияет на пользователя: меньше шанс, что огромный prompt, слишком тяжёлый structured-output или чрезмерный write-set приведут к долгому зависанию или частичной записи файлов. Вместо этого пользователь получает понятную bounded ошибку.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/task-start-llm.test.ts test/unit/task-actions-boundary.test.ts`.
  2. Убедиться, что oversized input/output/write-set завершается с `413` и `errorKind: "budget"`.
  3. При желании открыть unit-тесты и увидеть, что budget-path останавливается до частичной файловой записи и не маскируется под timeout/network/provider ошибку.

### `fix-preview-radix-slot-runtime`

- Что меняется для пользователя: preview больше не должен случайно ломаться на компонентах с `AlertDialog` и соседних Radix primitives из-за дрейфа версий внутри виртуального Sandpack-проекта.
- Как это влияет на пользователя: меньше шанс, что корректный локально компонент внезапно падает в preview из-за несовместимого набора `@radix-ui/*` зависимостей, собранного не так, как в рабочей установке.
- Как проверить:
  1. Запустить релевантный unit-набор preview builder для dependency graph Sandpack.
  2. Убедиться, что preview использует exact installed версии runtime-зависимостей вместо плавающих semver-диапазонов.
  3. При ручной проверке открыть задачу с `AlertDialog` или другим Radix-компонентом и убедиться, что preview не падает с ошибкой вида `createSlot is not a function`.

### `fix-preview-contract-review-gaps`

- Что меняется для пользователя: сохранённые project settings теперь реально управляют preview payload без скрытого отката к `shadcn/ui-kit`, а поздняя runtime-ошибка компонента не теряется после успешного старта preview.
- Как это влияет на пользователя: если в проекте выбран `none/html-tags` или `ant/ui-kit`, preview идёт именно с этими настройками; если компонент падает уже после `ready`, пользователь видит понятную runtime-диагностику вместо ложного “всё готово”.
- Как проверить:
  1. Запустить `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/project-ui-kit-switching.spec.ts test/e2e/sandpack-preview-style-runtime.spec.ts`.
  2. Убедиться, что `project-ui-kit-switching` последовательно подтверждает payload для `shadcn/ui-kit`, `none/html-tags` и `ant/ui-kit`.
  3. Убедиться, что `sandpack-preview-style-runtime` показывает `Компонент не удалось отрендерить в preview.` и точный текст `Тестовая runtime-ошибка preview`, а Radix-based preview path остаётся зелёным.

### `implement-test-real-onboarding-smoke-contract`

- Что меняется для пользователя: у команды теперь есть отдельная runnable-проверка, которая подтверждает совместимость не тестовой фикстуры, а реального onboarding checkout после `repair` или синхронизации.
- Как это влияет на пользователя: меньше риск, что локальная система выглядит зелёной на unit-слое, а реальный onboarding потом разваливается уже на живом checkout.
- Как проверить:
  1. Запустить `npm run test:traceability`.
  2. Запустить отдельную smoke-команду реального onboarding checkout по change-контракту.
  3. Убедиться, что проверка не подменяется unit-фикстурами и в случае проблемы даёт диагностику по реальному источнику/layout/sync state onboarding.

### `fix-release-notes-close-sync`

- Что меняется для пользователя: release notes теперь проще держать актуальными, потому что при закрытии release-linked change его пользовательское описание автоматически попадает в журнал релиза.
- Как это влияет на пользователя: меньше шанс, что релиз технически уже собран, а по release notes всё ещё непонятно, что реально доехало и как это проверить.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/openspec-release-notes.test.ts test/unit/browser-verification-runtime.test.ts`.
  2. Запустить `npm run test:traceability`.
  3. Убедиться, что при `os:close` release-linked change не теряет свою пользовательскую запись и не дублирует её повторно.

### `fix-release-close-active-members-guard`

- Что меняется для пользователя: команда разработки меньше рискует случайно “закрыть” релиз, у которого ещё остались незакрытые change в активном составе.
- Как это влияет на пользователя: меньше шанс, что релизная документация и фактическое состояние поставки разъедутся, а активные change начнут ссылаться на уже архивированный release.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/openspec-release-closure.test.ts`.
  2. Запустить `npm run test:traceability`.
  3. Убедиться, что guard явно ругается на попытку закрыть release с незакрытым active составом и требует сначала закрыть зависимые implement/fix change.

### `fix-release-members-kind`

- Что меняется для пользователя: release теперь не может тихо включить в состав неподходящий тип change, например `dispatcher`, `focus`, `idea`, `producer` или другой `release`.
- Как это влияет на пользователя: у команды меньше шанс случайно собрать релиз из неисполняемых или управляющих changes, а потом получить запутанный lineage и неверный состав поставки.
- Как проверить:
  1. Запустить `npm run test:unit -- openspec-roadmap-inheritance openspec-release-list`.
  2. Запустить `npm run test:traceability`.
  3. Убедиться, что release-проверки принимают только `implement` и `fix`, а попытка включить в релиз change другого kind считается ошибкой metadata.

### `fix-release-link-sync`

- Что меняется для пользователя: при release-dispatch change теперь привязывается к релизу полностью, без полусостояния между `.openspec.yaml` и `handoff.md`.
- Как это влияет на пользователя: меньше шанс, что release lineage будет выглядеть “наполовину прикреплённым”, когда metadata уже указывает на релиз, а handoff ещё нет, или наоборот.
- Как проверить:
  1. Запустить `npm run test:unit -- openspec-handoff`.
  2. Запустить `npm run test:traceability`.
  3. Убедиться, что после release-dispatch `release_ref` синхронно совпадает и в metadata, и в `handoff.md`, без ручного доворота документов.

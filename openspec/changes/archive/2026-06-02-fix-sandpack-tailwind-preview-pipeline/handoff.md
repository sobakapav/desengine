## Миссия

- Что должен изменить этот change: восстановить реальный preview style pipeline в Sandpack, чтобы iframe не только рендерил DOM, но и применял preview CSS/Tailwind к probe-элементу и пользовательскому компоненту.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: `release-2026-06-01-grooming`
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` уже выделил preview/runtime как отдельный bug-class и не допускает косметических заглушек. Предыдущий fix по sandpack-runtime закрыл timeout/incompatibility-диагностику, но не доказал фактическое применение CSS/Tailwind внутри iframe.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию и приёмку держит `dispatcher-bugfix`; этот fix отвечает за код preview-pipeline и доказательство browser-level style contract.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/task/spec.md
- openspec/specs/level-labs/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-sandpack-tailwind-preview-pipeline: `lib/lab/sandpack-preview.ts`, `lib/lab/sandpack-default-templates.ts`, `lib/lab/sandpack-templates/default/styles.css`, `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `test/unit/sandpack-preview.test.ts`, `test/e2e/sandpack-preview-style-runtime.spec.ts`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: локализация root cause в preview CSS pipeline, исправление runtime path, подтверждение styled preview в живом браузере и уточнение проверок так, чтобы `unstyled-dom` больше не проходил как приемлемый результат.
- Что сознательно не входит в этот change: переписывание всего preview-engine, замена Sandpack, ослабление style contract, скрытие warning без восстановления CSS, изменения в unrelated prompt/workbench flows.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам курс на browser-based preview и отдельную честную диагностику runtime уже принят; этот fix должен восстановить работоспособность pipeline, а не отменять диагностику.

## Проверка результата

- verification_level: component/browser
- verification_command: `npm run test:unit -- test/unit/sandpack-preview.test.ts` и `npm run test:e2e -- test/e2e/sandpack-preview-style-runtime.spec.ts`
- Что именно должен доказать результат проверки: browser runtime получает styled preview, probe приходит в `ready`, host не показывает warning про неподтверждённый style contract, а `unstyled-dom` остаётся только для реального CSS failure path.

## Root Cause

- Дефект был не в host warning, а в самом preview CSS path: Sandpack мог смонтировать React DOM, но не гарантировал материализацию Tailwind utility-правил внутри iframe.
- Первая поломка была server-side: route использовал `require.resolve("tailwindcss/index.css")`, а в Next route runtime это превращалось в `undefined`, из-за чего `/api/tasks/*/sandpack` падал `500` с `The "path" argument must be of type string`.
- После перевода на precompiled CSS route стал отвечать `200`, но browser-level contract всё ещё ложно маркировал iframe как `unstyled-dom`: probe одновременно требовал `width: 137px` и `min-width: 219px`, поэтому при реально применённом Tailwind вычисленная ширина не могла совпасть с ожидаемой.
- Для `react-ts` Sandpack более надёжный contract получается, когда entrypoint и рабочие файлы живут под `/src`, stylesheet попадает в iframe уже как готовый CSS, а probe использует непротиворечивые метрики, которые действительно различают styled и unstyled состояние.

## Что изменено

- `lib/lab/sandpack-preview.ts`: preview builder переведён на детерминированный server-side CSS path через `tailwindcss.compile()`. Кандидаты utility-классов собираются из пользовательского компонента, `styles.ts`, App template, level runtime, shadcn-файлов и runtime probe; в Sandpack уходит уже собранный `/src/styles.css`.
- `lib/lab/sandpack-preview.ts`: базовый виртуальный проект выровнен под `/src`-layout (`/src/index.tsx`, `/src/App.tsx`, `/src/Component.tsx`, `/src/styles.css`, `main=/src/index.tsx`), чтобы CRA/Sandpack не зависел от корневого file layout.
- `lib/lab/sandpack-default-templates.ts` и `lib/lab/sandpack-templates/default/styles.css`: базовый preview stylesheet использует совместимый с Tailwind v4 `@import "tailwindcss";` и `@theme inline`, а не runtime-only `@config`.
- `lib/lab/sandpack-preview.ts`: runtime probe переведён на непротиворечивый contract (`width + height + arbitrary colors`) вместо ложной пары `width + min-width`, которая сама генерировала false negative при успешном CSS.
- `test/unit/sandpack-preview.test.ts`: добавлены guardrails на prebuilt CSS, `/src` entrypoint и присутствие probe/component utility-правил в готовом stylesheet.
- `test/e2e/sandpack-preview-style-runtime.spec.ts`: happy-path больше не проглатывает warning/fallback; тест требует `data-desengine-preview-contract="ready"` и реальных CSS-свойств в iframe.
- `test/e2e/sandpack-preview-style-runtime.spec.ts`: fixture helper теперь очищает старый `prompt-history.json` и task-local residue перед запуском, чтобы browser acceptance проверял сам preview runtime, а не унаследованный пересчёт progress/history.
- `test/e2e/sandpack-preview-style-runtime.spec.ts`: runtime-error кейс больше не подделывает `window.postMessage` из host-страницы; browser-проверка вызывает реальный crash внутри preview iframe и ждёт product-level host diagnostics.
- `components/desengine/lab/InOut/OutRender/OutRender.tsx`: host UX развёл `unstyled-dom` и `render-error` в разные notices; runtime-crash больше не маркируется ложным заголовком про style contract.

## Runtime Contract после фикса

- `ready` отправляется только если probe внутри iframe реально получил ожидаемые computed styles из preview CSS, а сами ожидания совместимы с CSS layout-правилами и не создают ложный negative.
- `unstyled-dom` остаётся честным failure path для случаев, когда DOM смонтирован, но CSS до iframe не дошёл или не применился.
- `render-error` показывает отдельную host-диагностику о падении preview-компонента и не маскируется под style-contract failure.
- Диагностический host notice больше не считается допустимым результатом happy-path browser verification.

## Остаточные вопросы

- Этот fix не меняет install-critical stack и не подменяет Sandpack другим runtime; если позже появятся новые сбои CSS, их нужно разбирать уже как отдельные дефекты candidate extraction или iframe delivery, а не как повод ослабить contract.
- Финальная приёмка должна быть внешней и браузерной: unit-слой подтверждает сборку prebuilt CSS, но не заменяет живую проверку styled preview внутри iframe.

## Миссия

- Что должен изменить этот change: устранить ситуацию, в которой уточняющий запрос или проверка уровня могут зависнуть без bounded timeout, а UI остаётся в состоянии `Запуск…`/`Проверка…` без понятного выхода для пользователя.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: `release-2026-06-01-grooming`
- producer_ref: (не задан)
- Что из родительского change уже решено: dispatcher уже зафиксировал bugfix как локальный defect, влияющий на пользовательский task-flow. Root cause class сейчас кодовая: `lib/llm/runtime.ts` ставит timeout только для `target: "init"`, а `iterate`/`check` идут без `AbortSignal`; `useWorkbenchPrompt` и workbench actions держат pending до завершения fetch.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия bugfix-потока остаётся у `dispatcher-bugfix`; этот fix отвечает за bounded runtime behavior и user-facing feedback в prompt/check flow.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/iteration/spec.md
- openspec/specs/llm/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-iterate-timeout-feedback: `lib/llm/runtime.ts`, `lib/llm/errors.ts`, `components/desengine/lab/Workbench/useWorkbenchPrompt.ts`, `components/desengine/lab/Workbench/WorkbenchView.tsx`, `lib/task/actions/check.ts`, `test/unit/llm.server.test.ts`.

## Границы исполнения

- Что входит в этот change: добавить bounded timeout policy для `iterate` и `check`, превратить timeout в retriable user-facing ошибку, а также гарантировать, что UI выходит из pending и даёт понятную обратную связь вместо бесконечного ожидания.
- Что сознательно не входит в этот change: пересмотр prompt UX целиком, изменение лимитов промптов, redesign истории уточнений и provider-specific multimodal fixes.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам контракт init/iterate/check уже принят; fix уточняет failure-handling, а не смысл этих действий.

## Проверка результата

- verification_level: component/browser
- verification_command: DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/iterate-timeout-feedback.spec.ts
- Что именно должен доказать результат проверки: зависший provider request больше не оставляет пользователя в бесконечном pending; task action завершается bounded timeout-ошибкой, состояние задачи сохраняется, UI позволяет повторить действие.

## Реализовано

- `iterate` и `check` получили bounded server-side timeout через `LLM_ACTION_TIMEOUT_MS`, при этом `init` сохранил отдельный контракт `LLM_INIT_TIMEOUT_MS`.
- Workbench actions переведены на общий bounded client-side helper, который снимает pending через `finally` и возвращает retriable timeout-ошибку без потери состояния.
- `iterate` теперь явно маркируется как `target: "iterate"` на LLM runtime boundary.
- Добавлен unit-слой на runtime timeout policy и error-path `runPromptSubmission` / `runCheckSubmission`.
- Добавлен browser/e2e сценарий с controlled hanging endpoint для `/iterate` и `/check`, чтобы проверять именно UX timeout path, а не live-поведение провайдера.

## Внешняя проверка

- `npm run test:unit -- test/unit/iterate-timeout-feedback.test.ts`
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/iterate-timeout-feedback.spec.ts`
- `npm run test:traceability`

## Открытые вопросы

- Нужен ли в продукте один общий timeout для `iterate` и `check`, или позже их стоит развести по разным env-переменным.

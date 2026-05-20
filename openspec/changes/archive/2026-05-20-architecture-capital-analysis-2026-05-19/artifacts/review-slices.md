# Review Slices

## Цель

Текущий набор изменений уже слишком широкий для одного мысленного ревью. Чтобы не превращать архитектурную работу в прокрастинацию, фиксируем срезы, которые можно проверять независимо: каждый срез имеет свой риск, набор файлов и проверку.

Главный принцип: новая функциональность не добавляется. Срезы нужны, чтобы безопасно довести до ревью уже выполненную стабилизацию lab runtime, Project/Sandpack boundary и OpenSpec governance.

## Срез 1. Governance: code readability и OpenSpec metadata

Связанный change:

- `code-readability-practices-2026-05-19`

Что входит:

- `openspec/changes/code-readability-practices-2026-05-19/**`
- `tools/create-openspec-change.mjs`
- `test/unit/change-testing-guidance.test.ts`

Архитектурный смысл:

- это не пользовательская функциональность;
- это quality/governance слой, который должен помогать будущим changes быть понятнее и проверяемее;
- он не должен блокировать lab runtime stabilization и не должен менять install-critical стек.

Что проверять:

- metadata `short` нормализуется к правилу traceability: нижний регистр, длина до 75 символов, без финальной пунктуации;
- генератор OpenSpec change продолжает добавлять тестовую часть;
- capability `code-readability` остаётся отдельным governance-контрактом, а не скрытым runtime-требованием.
- текущий срез включён в архитектурную орбиту как governance baseline; активных implementation-действий по нему в этом проходе не планируется.

Команды:

- `npm run test:unit -- test/unit/change-testing-guidance.test.ts`
- `npm run test:traceability`

Риск:

- если попытаться закрыть весь `code-readability` прямо сейчас, это станет большим отдельным quality-project и отвлечёт от Project/Workbench/Storage transformation work.
- если превратить текущий baseline в prerequisite-блокер, архитектурная последовательность снова начнёт буксовать на governance вместо runtime ownership.

## Срез 2. Architecture decision memo и guardrails

Связанный change:

- `research-architecture-capital-analysis-2026-05-19`

Что входит:

- `openspec/changes/research-architecture-capital-analysis-2026-05-19/**`

Архитектурный смысл:

- фиксирует, почему ближайший фокус — стабилизация lab, а не новая фича;
- связывает `Project`, `Task`, `Workbench`, `SandpackPreview`, storage и testing layer в один порядок развития;
- задаёт guardrails: UX не трясти, стек не менять, новые платформенные shape не размножать.

Что проверять:

- artifacts описывают реальное состояние кода, а не желаемую картинку;
- roadmap соответствует фактическому порядку: hardening перед дальнейшим dev-mode/workbench ростом;
- следующие changes не добавляют новую пользовательскую функциональность поверх нестабильного runtime.

Команды:

- `npm run openspec`
- `npm run test:traceability`

Риск:

- memo может устареть быстрее кода. Поэтому этот срез должен быть коротко финализирован и дальше использоваться как decision record, а не как постоянно расширяемый документ.

## Срез 3. Lab runtime contract hardening

Связанный change:

- `implement-lab-runtime-contract-hardening`

Что входит:

- `lib/task/actions.ts`
- `lib/task/data.ts`
- `lib/task/mutation-boundary.ts`
- `lib/task/navigation.ts`
- `lib/system/navigation.ts`
- `app/api/tasks/[taskId]/{start,iterate,check,files,reset}/route.ts`
- `app/api/tasks/[taskId]/route.ts`
- `app/lab/[taskId]/**`
- `app/tasks/[taskId]/check/page.tsx`
- `test/unit/lab-route-contract.test.ts`
- `test/unit/task-actions-boundary.test.ts`
- `test/unit/task-data.test.ts`
- `test/unit/task-mutation-boundary.test.ts`
- source-contract updates in `test/unit/llm-flow-source-contract.test.ts` and `test/unit/p1-source-contracts.test.ts`

Архитектурный смысл:

- route handlers становятся тоньше;
- empty `TaskData` создаётся через единый factory;
- lab actions получают service boundary;
- save/reset проходят через минимальную per-task mutation boundary;
- пользовательский lab UX остаётся прежним.

Что проверять:

- HTTP response contract не изменился;
- route handlers не начали заново знать LLM/storage/prompt детали;
- same-task мутации сериализуются, different-task мутации не блокируют друг друга;
- reset/save/start/iterate/check покрыты mock/fixture service-level тестами.

Команды:

- `npm run test:unit -- test/unit/lab-route-contract.test.ts test/unit/task-data.test.ts test/unit/task-mutation-boundary.test.ts test/unit/task-actions-boundary.test.ts`
- `npm run test:traceability`

Риск:

- service boundary может стать новым god module. Следующий шаг должен быть не расширением `lib/task/actions.ts`, а разделением ownership между `TaskActionService`, `WorkbenchState`, `ProjectContext` и будущим storage adapter.

## Срез 4. Project/Sandpack preview boundary

Связанный change:

- `dispatcher-project-ui-kit-switching`

Что входит:

- `lib/project/runtime.ts`
- `lib/lab/sandpack-preview.ts`
- `app/api/tasks/[taskId]/sandpack/route.ts`
- `components/desengine/lab/Workbench/Workbench.tsx`
- `components/desengine/lab/InOut/**`
- `test/unit/project-ui-kit-switching.test.ts`
- `test/unit/sandpack-preview.test.ts`
- specs for `level-labs` and `task`

Архитектурный смысл:

- минимальный `Project` вводится как lab-preview scope, а не как полноценный workspace;
- Sandpack payload получает явный project context;
- `html-tags` incompatibility становится диагностируемой, а не скрытым падением preview;
- переключение UI kit не меняет URL и не перезагружает lab.

Что проверять:

- `Project` MVP не конфликтует с будущим `Project Workspace`;
- fallback безопасен и понятен пользователю;
- Workbench не превращается во владельца будущего project lifecycle;
- browser smoke подтверждает переключение без смены URL.

Команды:

- `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/sandpack-preview.test.ts`
- `npm run test:traceability`
- `npm run build`

Риск:

- этот срез уже похож на пользовательскую фичу, но в текущем контексте он нужен как boundary-stabilization. Следующий visible feature поверх него сейчас не начинаем.

## Срез 5. Build/test stabilization

Что входит:

- `app/e2e/lab-image-demo/page.tsx`
- `app/e2e/lab-image-demo/ClientDemo.tsx`
- общий прогон `npm run test:unit`, `npm run test:traceability`, `npm run build`

Архитектурный смысл:

- build должен оставаться зелёным после runtime и preview boundary изменений;
- e2e demo не должен ломать production build из-за client-side `useSearchParams`.

Что проверять:

- `ClientDemo` остаётся client-only;
- страница оборачивает client subtree в `Suspense`;
- правка не меняет продуктовый lab runtime.

Команды:

- `npm run build`

Риск:

- это не стратегический срез, но без него невозможно честно сказать, что архитектурная стабилизация не сломала сборку.

## Рекомендуемый порядок ревью

1. Срез 5: быстро подтвердить зелёный build.
2. Срез 3: проверить самый важный runtime hardening.
3. Срез 4: проверить Project/Sandpack boundary как продолжение hardening.
4. Срез 1: принять governance-readability отдельно, не смешивая с runtime.
5. Срез 2: финализировать decision memo как снимок принятого архитектурного решения.

## Что не делать сейчас

- Не начинать новую видимую функциональность.
- Не расширять UI kit wave.
- Не превращать `Project` в workspace до отдельного `dev-mode-project-work`.
- Не менять storage backend, Node.js, Turbopack, Next.js runtime или install-critical инфраструктуру.
- Не требовать полного автоматического закрытия всех readability scenarios как prerequisite для lab stabilization.

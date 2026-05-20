# Final Review Package

## Назначение

Этот пакет фиксирует итог стабилизационного прохода по архитектурной работе вокруг lab. Он нужен, чтобы ревьюить изменения не как один большой дифф, а как набор проверяемых срезов с понятным смыслом, командами и остаточными рисками.

Новая пользовательская функциональность сейчас не начинается. Главный результат — укрепление runtime-границ, Project/Sandpack boundary и OpenSpec/test guardrails без смены стека и без капитального изменения UX.

## Итоговое решение

Текущую работу можно двигать к ревью/коммитам по срезам:

1. `implement-lab-runtime-contract-hardening`
2. `dispatcher-project-ui-kit-switching`
3. build/test stabilization
4. `research-architecture-capital-analysis-2026-05-19`
5. `code-readability-practices-2026-05-19` как governance baseline в общей архитектурной орбите

## Срез 1. Lab Runtime Contract Hardening

Что вошло:

- HTTP route handlers для `start`, `iterate`, `check`, `files`, `reset` стали тонкими boundary.
- Core logic вынесена в `lib/task/actions.ts`.
- Empty `TaskData` строится через `createEmptyTaskData`.
- Добавлен in-process per-task mutation boundary.
- Canonical routes для `/lab` и `/tasks` собраны через helper-слой.
- Добавлены unit/service/source-contract проверки без live LLM credentials.

Ключевые файлы:

- `lib/task/actions.ts`
- `lib/task/data.ts`
- `lib/task/mutation-boundary.ts`
- `lib/task/navigation.ts`
- `lib/system/navigation.ts`
- `app/api/tasks/[taskId]/{start,iterate,check,files,reset}/route.ts`
- `test/unit/task-actions-boundary.test.ts`
- `test/unit/task-mutation-boundary.test.ts`
- `test/unit/task-data.test.ts`
- `test/unit/lab-route-contract.test.ts`

Проверено:

- `npm run test:unit -- test/unit/task-mutation-boundary.test.ts test/unit/task-actions-boundary.test.ts test/unit/lab-route-contract.test.ts test/unit/task-data.test.ts`
- `npm run test:traceability`
- `git diff --check`

Остаточные риски:

- Mutation boundary пока in-process, а не storage/file lock.
- Долгий LLM-call теперь может удерживать очередь same-task мутаций. Это безопасно для консистентности, но позже может потребовать отдельного решения про optimistic save/cancellation.
- Полный browser/e2e lab-flow не добавлен; текущий контракт закрыт service-level mock-проверкой.

Вывод:

- Срез готов к ревью как основной архитектурный runtime hardening.

## Срез 2. Project/Sandpack Preview Boundary

Что вошло:

- Введён минимальный `Project` для lab-preview scope: `id`, `title`, `uiKitId`, `uiMode`.
- Sandpack payload принимает project context явно.
- UI kit выбирается на уровне проекта без перезагрузки страницы.
- `html-tags` compatibility проверяется до рендера.
- При несовместимости preview получает безопасный fallback-компонент.
- Диагностика показывается только при реальной несовместимости, чтобы не шуметь в нормальном UX.

Ключевые файлы:

- `lib/project/runtime.ts`
- `lib/lab/sandpack-preview.ts`
- `app/api/tasks/[taskId]/sandpack/route.ts`
- `components/desengine/lab/Workbench/Workbench.tsx`
- `components/desengine/lab/InOut/OutRender/OutRender.tsx`
- `test/unit/project-ui-kit-switching.test.ts`
- `test/unit/sandpack-preview.test.ts`

Проверено:

- `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/sandpack-preview.test.ts`
- `npm run test:traceability`
- `npm run build`
- `git diff --check`

Остаточные риски:

- `Project` хранится в `localStorage`; это допустимо для MVP lab-preview, но не должно становиться будущим Project Workspace storage.
- `uiMode` пока фактически один: `html-tags`. Расширять режимы нужно отдельным change.

Вывод:

- Срез готов к ревью как boundary-stabilization. Не надо поверх него сейчас начинать wave новых UI kit changes.

## Срез 3. Build/Test Stabilization

Что вошло:

- `/e2e/lab-image-demo` оборачивает client subtree в `Suspense`.
- Demo использует общий `createEmptyTaskData`, а не копирует shape вручную.
- Production build остаётся зелёным после runtime/preview изменений.

Ключевые файлы:

- `app/e2e/lab-image-demo/page.tsx`
- `app/e2e/lab-image-demo/ClientDemo.tsx`

Проверено:

- `npm run build`
- `git diff --check`

Остаточные риски:

- Это технический supporting fix, не отдельная архитектурная ставка.

Вывод:

- Срез можно ревьюить вместе с build/test stabilization, но не смешивать по смыслу с runtime hardening.

## Срез 4. Architecture Capital Analysis

Что вошло:

- AS-IS карта.
- Risk register.
- TO-BE architecture.
- Roadmap.
- Decision memo.
- Review slices.
- Этот final review package.

Ключевые файлы:

- `openspec/changes/research-architecture-capital-analysis-2026-05-19/artifacts/as-is-map.md`
- `openspec/changes/research-architecture-capital-analysis-2026-05-19/artifacts/risk-register.md`
- `openspec/changes/research-architecture-capital-analysis-2026-05-19/artifacts/target-architecture.md`
- `openspec/changes/research-architecture-capital-analysis-2026-05-19/artifacts/roadmap.md`
- `openspec/changes/research-architecture-capital-analysis-2026-05-19/artifacts/decision-memo.md`
- `openspec/changes/research-architecture-capital-analysis-2026-05-19/artifacts/review-slices.md`

Проверено:

- `npm run openspec`
- `npm run test:traceability`

Остаточные риски:

- Документы должны стать decision record, а не бесконечно расширяемым рабочим черновиком.

Вывод:

- Research-change можно считать закрытым по содержанию после ревью.

## Срез 5. Code Readability Practices

Что вошло реально:

- OpenSpec change с широким governance-контрактом readability.
- Tooling-правка в генераторе OpenSpec change: нормализация `short`.
- Unit/source-contract проверка generator guidance.

Ключевые файлы:

- `openspec/changes/code-readability-practices-2026-05-19/**`
- `tools/create-openspec-change.mjs`
- `test/unit/change-testing-guidance.test.ts`

Проверено:

- `npm run test:unit -- test/unit/change-testing-guidance.test.ts`
- `npm run test:traceability`
- `git diff --check`

Статус:

- Формулировки change считаются достаточно проработанными для governance baseline.
- Активных действий по этому change в текущем архитектурном проходе больше не планируется.
- Практики читаемости применяются как guardrail для новых changes и ревью.
- Полная автоматизация readability checks может быть выделена позже отдельным implementation-change, если понадобится.

Вывод:

- Включить в орбиту архитектурного dispatcher'а.
- Не делать prerequisite-блокером для lab/runtime transformation changes.

## Общий тестовый статус

Последние зелёные проверки в ходе стабилизации:

- `npm run test:unit`
- `npm run test:traceability`
- `npm run build`
- `npm run openspec`
- `git diff --check`

Точечные проверки:

- `npm run test:unit -- test/unit/task-mutation-boundary.test.ts test/unit/task-actions-boundary.test.ts test/unit/lab-route-contract.test.ts test/unit/task-data.test.ts`
- `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/sandpack-preview.test.ts`
- `npm run test:unit -- test/unit/change-testing-guidance.test.ts`

## Не делать следующим шагом

- Не начинать новую видимую функциональность поверх lab.
- Не расширять UI kit wave.
- Не превращать localStorage Project MVP в полноценный workspace.
- Не менять Node.js, Next.js, Turbopack, Sandpack или install-critical инфраструктуру.
- Не превращать `code-readability-practices` в активный implementation stream прямо сейчас.

## Рекомендуемая упаковка в review/commit sequence

1. `lab-runtime-contract-hardening`: service boundary, mutation boundary, route helpers, related specs/tests.
2. `project-ui-kit-switching`: Project runtime, Sandpack payload, Workbench selector, compatibility fallback, related specs/tests.
3. `build-test-stabilization`: e2e demo Suspense/factory fix.
4. `architecture-capital-analysis`: artifacts and decision records.
5. `code-readability-practices`: держать как governance baseline, включённый в dispatcher.

## Следующий архитектурный шаг после ревью

Следующий шаг оформлен отдельным dispatcher-change:

- `dispatcher-architecture-transformation`

Он режет дальнейшее внедрение архитектуры на последовательность transformation changes: Project Workspace/Storage, Task/Workflow/Artifact, Component Sourcing Strategy, Workbench Platform, Prompt Context, Event Envelope и Packaging Readiness.

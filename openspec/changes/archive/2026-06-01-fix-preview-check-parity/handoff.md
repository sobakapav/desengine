## Миссия

- Что должен изменить этот change: устранить product-level drift, при котором preview ломается, а задача проходит check как успешная.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` уже квалифицировал такие пользовательские жалобы как локальные reproducible defects, которые нужно чинить через отдельные fixes, а не списывать на “особенности режима”.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию bugfix-линии держит `dispatcher-bugfix`; этот fix отвечает за preview/check parity и доказательство, что пользователь больше не получает молчаливое противоречие двух контуров.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/dispatcher-bugfix/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-preview-check-parity: `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `lib/lab/sandpack-preview.ts`, `lib/task/actions/check.ts`, `lib/task/actions/iterate.ts`, `test/e2e/*preview*`, `test/integration/task-routes.test.ts` и документ-источник `https://docs.google.com/document/d/13yc4ovhcnwq0SBsdU6SZTz4Uke_Xip9ZI0sUyEKShQ0/export?format=txt`.

## Границы исполнения

- Что входит в этот change: repro broken preview + successful check, локализация contract drift, точечное исправление и browser-level guard на этот сценарий.
- Что сознательно не входит в этот change: общая переработка preview-engine, unrelated Safari/runtime issues и ослабление check-логики без доказанной причины.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix должен восстанавливать понятный пользовательский контракт, а не прятать проблему за менее информативными сообщениями.

## Проверка результата

- verification_level: component/browser
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/preview-check-parity.spec.ts`
- Что именно должен доказать результат проверки: пользователь больше не получает broken preview и успешный check как молчаливо совместимые состояния одного решения.

## Текущее состояние доказательств

- Добавлен helper `getPreviewCheckGuardMessage`, который блокирует check только для честного `render-error`.
- `components/desengine/lab/InOut/OutRender/OutRender.tsx` теперь показывает отдельную notice о недоступности проверки и временно блокирует кнопку `Проверить результат` на клиенте, не меняя backend check pipeline.
- Unit-подтверждение прошло: `npm run test:unit -- test/unit/preview-runtime-contract-message.test.ts test/unit/preview-runtime-contract-state.test.ts` -> `2 files passed`, `7 tests passed`.
- Первый browser-прогон показал, что fixture был недосеян: `GET /api/tasks/dipole-checkbox/sandpack` и `GET /api/tasks/dipole-checkbox/hint` отвечали `404`, потому что started task path не имел `prompt-history.json`.
- Fixture исправлен: test теперь создаёт `prompt-history.json`, после чего `/lab/dipole-checkbox`, `/hint` и `/sandpack` отвечают `200`.
- Отдельный browser guard `test/e2e/preview-check-parity.spec.ts` подтверждён через canonical wrapper: `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/preview-check-parity.spec.ts` -> `1 passed`.
- Guard изолирует проверяемый контракт: host получает честный `render-error` runtime signal, показывает сообщение `Проверка результата временно недоступна`, блокирует кнопку `Проверить результат` и не отправляет запрос в `/api/tasks/<taskId>/check`.
- Важно: общий `test/e2e/sandpack-preview-style-runtime.spec.ts` в текущем рабочем дереве всё ещё падает на preview runtime contract (`ready`/incompatibility/render-error paths). Это внешний дефект preview-runtime линии, а не доказательство против данного parity guard; закрывать его нужно отдельным change или в соответствующем preview-runtime fix.

## Открытые вопросы

- Является ли broken preview причиной ложного успеха check, или check лишь не учитывает важный пользовательский signal.
- Нужен ли дополнительный integration test на route/service boundary помимо browser guard.

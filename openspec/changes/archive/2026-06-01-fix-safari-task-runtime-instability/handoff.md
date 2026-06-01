## Миссия

- Что должен изменить этот change: превратить жалобу на медленный, частично неоткрывающийся задачник в Safari в локализованный runtime defect и исправить его без ухода в общую “оптимизацию всего”.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-runtime
- strategy_root: focus-tech
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-runtime` удерживает границы лабораторного runtime и ожидает, что task shell, navigation и browser execution path остаются работоспособными в реальном пользовательском браузере.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию runtime-контура держит `dispatcher-runtime`; этот fix отвечает за конкретную Safari деградацию и доказательство, что browser path снова стабилен.

## Обязательные источники

- openspec/changes/dispatcher-runtime/proposal.md
- openspec/changes/dispatcher-runtime/design.md
- openspec/changes/dispatcher-runtime/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-safari-task-runtime-instability: `components/desengine/lab/Workbench/WorkbenchView.tsx`, `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `lib/project/runtime.ts`, `lib/lab/sandpack-preview.ts`, `lib/auth/*`, релевантные browser/integration tests и документ-источник `https://docs.google.com/document/d/13yc4ovhcnwq0SBsdU6SZTz4Uke_Xip9ZI0sUyEKShQ0/export?format=txt`.

## Границы исполнения

- Что входит в этот change: воспроизведение Safari path, локализация runtime bottleneck/crash, точечное исправление и browser-level guard на сценарий входа в задачник и перехода к задаче.
- Что сознательно не входит в этот change: пересборка всей frontend-архитектуры, install warning про workspace root, task-content/hints fixes и общая “оптимизация производительности без repro”.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам подход с browser verification и runtime boundary уже принят; этот fix должен доказать конкретный failure path, а не спорить с общим устройством лаборатории.

## Проверка результата

- verification_level: component/browser
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/safari-task-runtime-instability.spec.ts`
- Что именно должен доказать результат проверки: host preview path игнорирует анонимные и stale runtime contract messages, а рабочая лаборатория не поднимает ложную runtime-ошибку от чужого preview-сеанса.

## Открытые вопросы

- Открытых вопросов по scope этого fix не осталось.

## Итог реализации

- Локализованный root cause: host принимал любой `postMessage` от Sandpack runtime по одному только `source/type`, без привязки к текущему preview-сеансу.
- Точечный fix: `OutRender` генерирует `previewSessionId`, route `/api/tasks/[taskId]/sandpack` передаёт его в preview builder, а generated `preview-runtime-contract.tsx` возвращает его обратно в contract message.
- Host теперь игнорирует contract messages без `previewSessionId` или от чужой preview-сессии и не поднимает ложную runtime-диагностику для текущего preview.

## Статус change

- Текущий статус: готов к закрытию.
- Что закрыто: preview-session slice с unscoped/stale runtime contract messages, fixture-авторизация, вход в `/lab/dipole-checkbox` и появление Sandpack iframe в browser verification path.
- Второй root cause после стабилизации окружения не подтвердился в рамках этого scope.

## Изменённые файлы

- `components/desengine/lab/InOut/OutRender/OutRender.tsx`
- `components/desengine/lab/InOut/preview-runtime-contract-message.ts`
- `app/api/tasks/[taskId]/sandpack/route.ts`
- `lib/lab/sandpack-preview.ts`
- `test/unit/preview-runtime-contract-message.test.ts`
- `test/unit/sandpack-preview.test.ts`
- `test/e2e/safari-task-runtime-instability.spec.ts`

## Проверки и ограничения

- Подтверждено адресным unit-слоем:
  - `npm run test:unit -- test/unit/preview-runtime-contract-message.test.ts test/unit/sandpack-preview.test.ts`
- Browser verification с fixture-доступом прошла после очистки повреждённого dev-cache `.next/dev`:
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/safari-task-runtime-instability.spec.ts`
  - результат: `1 passed`.
- Перед успешным прогоном была зафиксирована не кодовая причина падения target server: Turbopack corrupted database в `.next/dev` (`Failed to deserialize AMQF`, `ArrayLengthMismatch`). Install-critical инфраструктура не менялась.

## Следующий этап

- Закрыть change штатным `os:close`.

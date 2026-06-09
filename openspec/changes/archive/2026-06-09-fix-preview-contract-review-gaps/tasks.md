## Tasks

- [x] 1. Убрать принудительную нормализацию `ProjectWorkspace` к `shadcn/ui-kit` и обновить unit-контракт storage boundary.
- [x] 2. Исправить merge preview runtime state, чтобы поздний `render-error` не терялся после `ready`.
- [x] 3. Усилить browser-регрессии для `project-ui-kit-switching`, style-contract и Radix preview path.
- [x] 4. Обновить OpenSpec/spec или release-docs там, где текущая документация расходится с исправленным контрактом.
- [x] 5. Закрыть change через независимую внешнюю проверку.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios:
  - `task` / `Sandpack preview использует project.uiKitId`
  - `task` / `Project storage сохраняет выбранный uiKit без принудительной миграции`
  - `task` / `Preview runtime показывает render-error после позднего падения компонента`
  - `task` / `Preview runtime стабильно рендерит Radix-based component path`
- [x] Уровень проверки:
  - `unit` для storage boundary и merge helper
  - `browser` для `project-ui-kit-switching` и `sandpack-preview-style-runtime`
- [x] Команды запуска:
  - `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/preview-runtime-contract-state.test.ts test/unit/sandpack-preview.test.ts`
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/project-ui-kit-switching.spec.ts test/e2e/sandpack-preview-style-runtime.spec.ts`
- [x] Mock/fixture-данные:
  - browser runtime использует task fixtures из `test/e2e/fixtures`
  - сценарий Radix-path опирается на реальный preview payload и iframe-runtime, а не на поддельный host-side `postMessage`
- [x] Live credentials:
  - не нужны

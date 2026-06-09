## Миссия

- Закрыть критичные review-разрывы quality-релиза на границе `project.uiKitId` storage, host diagnostics preview runtime и browser regression evidence.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: (не задан)
- Что из родительского change уже решено: такие дефекты нужно чинить как реальные runtime/storage boundary bugs с воспроизводимым test evidence, а не как cosmetic cleanup.
- Кто отвечает за стратегию, тактику и приёмку результата: `dispatcher-bugfix`, `release-2026-06-02-quality`, `focus-quality`.

## Обязательные источники

- openspec/specs/task/spec.md
- lib/project/storage.ts
- components/desengine/lab/InOut/preview-runtime-contract-state.ts
- test/unit/project-ui-kit-switching.test.ts
- test/unit/preview-runtime-contract-state.test.ts
- test/e2e/project-ui-kit-switching.spec.ts
- test/e2e/sandpack-preview-style-runtime.spec.ts
- openspec/changes/release-2026-06-02-quality/release-notes.md

## Границы исполнения

- Что входит в этот change: storage contract fix, host diagnostics fix, browser regression hardening, синхронизация release traceability по затронутым change/docs.
- Что сознательно не входит в этот change: новый UX-flow lab, замена preview runtime, пересборка release strategy целиком.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: разделение quality и UI release-потоков, использование Sandpack как текущего preview runtime, обязательность OpenSpec traceability.

## Проверка результата

- verification_level: browser
- verification_command: `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/project-ui-kit-switching.spec.ts test/e2e/sandpack-preview-style-runtime.spec.ts`
- Что именно должен доказать результат проверки:
  - project storage больше не затирает `uiKitId/uiMode`;
  - preview runtime показывает `render-error`, даже если сбой произошёл после `ready`;
  - browser-путь подтверждает style-contract и Radix runtime без ложноположительных или слишком общих DOM-проверок.

## Открытые вопросы

- Нужно ли после этого выносить release traceability cleanup archived handoff-файлов в отдельный maintenance change, если для полного согласования придётся переписать исторические ссылки.

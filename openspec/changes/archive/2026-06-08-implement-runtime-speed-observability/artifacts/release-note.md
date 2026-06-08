- Что меняется для пользователя: если лаборатория начинает тормозить или вести себя нестабильно в `start`, `iterate`, `check` или preview, теперь у команды есть гораздо более понятная диагностика, где именно возникла проблема.
- Как это влияет на пользователя: ошибки и замедления в ключевых шагах проще локализовать, поэтому меньше шанс, что деградация останется «непонятным торможением» без причины и будет дольше мешать работе.
- Как проверить:
  1. Запустить `npm run test:unit -- test/unit/task-actions-boundary.test.ts test/unit/sandpack-preview.test.ts`.
  2. Убедиться, что проверки читают `runtimeDiagnostics` для `start`, `iterate`, `check`, `mutation_boundary` и `preview_payload_build`.
  3. При желании открыть `test/unit/task-actions-boundary.test.ts` и `test/unit/sandpack-preview.test.ts` и увидеть, что diagnostics содержат `durationMs`, status, size/load поля и сигналы degradation.

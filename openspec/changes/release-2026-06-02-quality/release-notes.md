# Release Notes

Этот файл веду по мере готовности и закрытия changes из релиза.

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
- `implement-level-reset-entrypoint`
- `implement-ux-highlight-correct-solution-diff`
- `implement-ux-merge-generate-check-phases`
- `implement-ux-return-to-level-task-list`

## Смысл волны

Это quality-релиз, который объединяет speed/load-срез `producer-speed-and-load` и весь текущий active UX-набор `dispatcher-ux`:

- ускорение preview/workbench payload pipeline;
- bounded guardrail'ы на task action runtime;
- budget'ы на LLM payload, structured-output и write-set.
- performance budget verdicts в тестовом слое;
- reusable regression harness для speed/load сценариев;
- structured runtime observability для локализации regressions и guardrail-срабатываний.
- UX entrypoint для сброса только текущего уровня;
- post-success объясняющий diff/summary-слой;
- единый UX-поток до состояния `Проверка пройдена`;
- возврат к списку задач уровня после успешного завершения задачи.

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

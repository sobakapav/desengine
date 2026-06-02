# Release Notes

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

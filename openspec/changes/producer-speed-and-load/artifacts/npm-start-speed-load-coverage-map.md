# Coverage Map: npm run start speed/load

## Назначение

Эта карта фиксирует producer-owned картину speed/load линии для user-facing режима `npm run start`:

- где находится риск;
- кто tactical owner;
- есть ли implement change;
- есть ли guardrail;
- есть ли тестовый слой;
- есть ли diagnostics/observability.

## Матрица

| Линия риска | Основные точки | Tactical owner | Implement changes | Guardrail status | Test status | Observability status |
| --- | --- | --- | --- | --- | --- | --- |
| Preview payload и Workbench rebuild | `app/api/tasks/[taskId]/sandpack/route.ts`, `lib/lab/sandpack-preview.ts`, `lib/system/shadcn-files.ts`, `lib/lab/sandpack-runtime-dependencies.ts` | `dispatcher-workbench` | `implement-workbench-preview-payload-budgeting` | planned | partial | planned via `implement-runtime-speed-observability` |
| Task action backlog и mutation pressure | `runTaskMutation`, `start`, `iterate`, `check`, `save`, `reset` | `dispatcher-runtime` | `implement-runtime-task-load-guardrails` | planned | partial | planned via `implement-runtime-speed-observability` |
| LLM payload / output / write-set | `start-llm`, `iterate-llm`, `check`, parse/write stages | `dispatcher-runtime` | `implement-runtime-llm-payload-budgets` | planned | partial | planned via `implement-runtime-speed-observability` |
| Runtime diagnostics и локализация regressions | duration, size, cache/degradation, overload signals | `dispatcher-runtime` | `implement-runtime-speed-observability` | n/a | partial | planned |
| Performance verdicts в test layer | budget checks для `start`, `iterate`, `check`, preview, lab entry | `dispatcher-test-system` | `implement-test-performance-budget-verdicts` | n/a | planned | зависит от runtime observability |
| Reusable regression harness | cold/warm, repeated actions, overload, oversize | `dispatcher-test-system` | `implement-test-speed-load-regression-harness` | n/a | planned | depends on diagnostics surface |

## Следующие gaps

1. Нет канонического performance verdict surface в тестовом слое.
2. Нет reusable regression harness для speed/load сценариев.
3. Нет цельного structured observability contract для runtime paths.
4. Guardrail'ы и budget'ы пока оформлены как active implement changes, но ещё не подтверждены внешней проверкой.

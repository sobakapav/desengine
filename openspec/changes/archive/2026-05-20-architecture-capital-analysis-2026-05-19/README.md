# research-architecture-capital-analysis-2026-05-19

Капитальный архитектурный анализ системы: выявить стратегические недочёты и наметить пути их решения (архитектурный план).

## Артефакты

- `artifacts/as-is-map.md` — карта текущей архитектуры, подсистем, потоков и архитектурного капитала.
- `artifacts/risk-register.md` — реестр стратегических рисков, первопричин, последствий и планов действий.
- `artifacts/target-architecture.md` — целевая архитектура, границы сущностей и guardrails.
- `artifacts/roadmap.md` — рекомендуемый порядок changes на ближайшие 1-2 итерации и traceability plan.
- `artifacts/decision-memo.md` — короткое решение о следующем архитектурном шаге.

## Ключевой вывод

Система уже имеет сильный фундамент: OpenSpec + traceability, доменные каталоги, Zod-схемы, LLM adapters, Sandpack preview и защиту рабочего набора файлов. Главный риск — не недостаток фич, а размножение платформенных сущностей (`Project`, `Workbench`, `Artifact`, `Event`) без единого контракта.

Рекомендуемый путь: сначала стабилизировать текущий lab и минимальный `Project`, затем выделять `Task/Workflow/Workbench`, и только после этого расширять UI kits, import, experience/cost и packaging.

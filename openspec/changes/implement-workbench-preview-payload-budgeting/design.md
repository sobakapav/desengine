## Context

`dispatcher-workbench` уже задаёт Workbench как owner пользовательского рабочего стола и его tool/runtime contracts. Для `npm run start` самым заметным performance-path внутри этой линии сейчас является preview:

- `app/api/tasks/[taskId]/sandpack/route.ts` собирает payload на каждый запрос;
- `lib/system/shadcn-files.ts` может рекурсивно читать всё дерево `components/ui`;
- `lib/lab/sandpack-runtime-dependencies.ts` заново разворачивает dependency graph;
- `lib/lab/sandpack-preview.ts` компилирует и кеширует derived preview artifacts.

Проблема не только в latency. При отсутствии явных budget'ов этот путь может съедать лишние CPU/RAM на машине пользователя, особенно при повторных refresh'ах preview и переключении project/UI mode.

## Goals

- Ускорить повторную и типовую сборку preview payload.
- Ввести явные budget'ы для cache и derived artifacts preview pipeline.
- Сохранить user-facing устойчивость Workbench при дорогой или перегруженной preview-сборке.

## Non-goals

- Не менять product semantics task/start/iterate/check.
- Не заниматься общими runtime queue guardrail'ами вне preview path.
- Не выносить preview в отдельную инфраструктуру или внешний сервис.

## Decisions

1. Workbench preview должен иметь bounded cache policy.
   - Наличие cache допустимо только вместе с политикой очистки/eviction.
   - Нельзя считать бесконечный `Map` приемлемым preview-контрактом.

2. Повторное чтение стабильных runtime-источников должно уменьшаться.
   - Это касается прежде всего `components/ui`, dependency metadata и других runtime inputs, которые меняются существенно реже, чем пользовательский `Component.tsx`.

3. При выходе preview за допустимую resource-стоимость нужен controlled degradation.
   - Лучше вернуть безопасный fallback или явный bounded error, чем продолжать тяжёлую сборку без лимитов.

## Risks / Trade-offs

- Более агрессивный cache может дать stale preview, если неверно выбран cache key.
- Слишком жёсткий budget может ухудшить гибкость preview для сложных компонентов.
- Часть ускорения может потребовать явного различения stable runtime inputs и user-authored task files.

## Open Questions

- Какие именно preview inputs достаточно стабильны для reuse между запросами в `npm run start`.
- Нужен ли один общий budget на весь preview pipeline или разные лимиты для dependency graph, CSS compile и shadcn file snapshot.

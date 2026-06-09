## Context

Активные `implement-ux-highlight-correct-solution-diff`, `implement-task-titles`, `implement-integrate-monaco-editor-into-sandpack` и `implement-system-markdown-announcement` меняют пользовательский интерфейс напрямую: первый влияет на восприятие результата проверки, второй добавляет человекочитаемые названия в task-контур, третий переосмысляет связку редактора и preview внутри лаборатории, четвёртый добавляет внешний Markdown-анонс на системную страницу. Для quality-релиза, который должен оставаться подкапотным, такие changes создают смешанный релизный смысл.

## Goals

- Выделить прямой UI/UX-change в отдельный release lineage.
- Не менять tactical ownership и не переоткрывать решение `dispatcher-ux`.
- Сохранить release как no-code слой фиксации состава поставки.

## Non-goals

- Не реализовывать сам downstream UI-change внутри release.
- Не переносить в этот релиз посторонние quality/runtime changes.
- Не менять producer/dispatcher topology.

## Decisions

1. `release-2026-06-09-ui` создаётся как отдельная активная релизная метка.
2. На текущем составе этот release содержит:
   - `implement-ux-highlight-correct-solution-diff`;
   - `implement-task-titles`.
   - `implement-integrate-monaco-editor-into-sandpack`.
   - `implement-system-markdown-announcement`.
3. `release-2026-06-02-quality` сохраняет подкапотный quality-смысл и больше не держит эти active UI-changes.

## Risks / Trade-offs

- Появляется ещё один активный release change, который нужно отдельно поддерживать.
- Если позже появятся новые прямые UI/UX-changes, придётся решить, входят ли они в эту же UI-волну или в следующий release.

## Open Questions

- Станет ли `release-2026-06-09-ui` контейнером и для уже закрытых UX-changes, если понадобится полностью пересобрать релизную историю UI-среза.

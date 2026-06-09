## Why

`release-2026-06-02-quality` лучше оставить релизом подкапотного качества: runtime guardrail'ы, payload budget'ы, preview/runtime fixes, observability, regression-harness и тестовый контракт. Прямой UX-change `implement-ux-highlight-correct-solution-diff` лучше отделить в самостоятельный UI-релиз, чтобы релизная матрица не смешивала пользовательский интерфейс и внутреннее hardening-качество.

## What Changes

- Создан release change `release-2026-06-09-ui`.
- В этот релиз переведены `implement-ux-highlight-correct-solution-diff`, `implement-task-titles`, `implement-integrate-monaco-editor-into-sandpack` и `implement-system-markdown-announcement`.
- У downstream changes фиксируется `release_ref=release-2026-06-09-ui`.
- Тактическое подчинение `dispatcher-ux` не меняется.

## Impact

- UI-change с прямым пользовательским эффектом больше не смешивается с quality-релизом.
- Состав UI-волны включает diff-подсветку, явные названия задач в task-контуре, идею более цельного Monaco/Sandpack editing-preview UX и внешний Markdown-анонс на системной странице.
- `release-2026-06-02-quality` становится ближе к чистому under-the-hood delivery-срезу.
- Release lineage остаётся явным без изменения `parent_change` и других связей downstream change.

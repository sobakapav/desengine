## Миссия

- Зафиксировать active release `release-2026-06-09-ui`, чтобы прямые пользовательские changes `implement-ux-highlight-correct-solution-diff`, `implement-task-titles`, `implement-integrate-monaco-editor-into-sandpack` и `implement-system-markdown-announcement` получили отдельный release lineage.
- Не смешивать этот downstream UI-change с подкапотной quality-волной `release-2026-06-02-quality`.

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что уже решено: `dispatcher-ux` уже зафиксировал `implement-ux-highlight-correct-solution-diff` как downstream UI-change прямой реализации, а `dispatcher-tasks` держит `implement-task-titles` как downstream change task-контура с прямым пользовательским эффектом.
- Кто отвечает за стратегию, тактику и приёмку результата: тактику и приёмку downstream change держит `dispatcher-ux`, а release фиксирует только состав UI-волны.

## Обязательные источники

- `openspec/changes/release-2026-06-09-ui/proposal.md`
- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/dispatcher-ux/design.md`
- `openspec/changes/dispatcher-tasks/proposal.md`
- `openspec/changes/dispatcher-tasks/design.md`
- metadata и proposal `implement-ux-highlight-correct-solution-diff`
- metadata и proposal `implement-task-titles`
- metadata и proposal `implement-integrate-monaco-editor-into-sandpack`
- metadata и proposal `implement-system-markdown-announcement`

## Границы исполнения

- Что входит в этот change: создание релизной метки и фиксация состава UI-волны.
- Что сознательно не входит в этот change: реализация downstream UI-change, смена `parent_change`, расширение релиза на посторонние active changes.
- Какие решения уже принадлежат downstream тактике и не должны переоткрываться: границы UX-feedback-контура уже принадлежат `dispatcher-ux`.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: release change корректно оформлен, `implement-ux-highlight-correct-solution-diff`, `implement-task-titles`, `implement-integrate-monaco-editor-into-sandpack` и `implement-system-markdown-announcement` ссылаются на него через `release_ref`, а состав UI-волны явно отделён от quality-release.

## Открытые вопросы

- Нужна ли позже полная перегруппировка уже архивированных UX-changes в отдельный UI-release lineage.

## Context

`dispatcher-ui-kit` и связанные preview-контракты уже доказали, что проектный контекст нужен хотя бы для `uiKitId` и `uiMode`. Но `producer-project` требует большего: `Project` должен стать новой product boundary, а не частной настройкой Workbench.

Архитектурно это пересекается с `producer-architecture-transform`: если мы сейчас не зафиксируем canonical project shape и явный storage boundary, downstream changes начнут строить свои собственные project forms.

## Goals

- Поднять `Project` из preview-local состояния в canonical `ProjectWorkspace`.
- Зафиксировать project registry и active project context как базу для следующих project-facing changes.
- Дать лаборатории и task runtime единый источник project settings.

## Non-goals

- Не мигрировать весь пользовательский прогресс в project storage в этой ветке.
- Не делать сразу полноценный project shell / roadmap / PM-layer.
- Не спорить с downstream ветками, которые будут связывать `task`, `workflow` и `workbench` с проектом глубже.

## Decisions

1. `ProjectWorkspace` становится canonical shape первой волны.

2. Создание проекта в MVP требует минимум:
   - `id`;
   - имя;
   - `settings.uiKitId`;
   - `settings.uiMode`.

3. Project storage оформляется через adapter boundary, даже если физический backend пока остаётся локальным.

4. Лаборатория больше не создаёт отдельный ad-hoc project shape поверх сохранённого workspace.

## Risks / Trade-offs

- Если впихнуть сюда полный task/workflow/workbench binding, change станет слишком широким.
  -> Mitigation: ограничить scope canonical workspace и active project context.

- Если не описать minimal create/select UX, сущность проекта появится только на бумаге.
  -> Mitigation: включить в change хотя бы минимальный project registry и active project selection contract.

## Open Questions

- Какой минимальный UX surface станет canonical местом выбора active project в первой волне.
- Нужно ли с первой ветки вводить явную project metadata-модель помимо `name` и `settings`.

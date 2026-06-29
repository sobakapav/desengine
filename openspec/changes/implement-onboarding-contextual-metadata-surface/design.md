## Context

Этот change отвечает только за user-facing metadata cleanup. Он нужен после project/workflow/check
waves, чтобы интерфейс не оставался засорённым внутренними полями старого режима.

## Goals

- Показать только metadata, нужные для project/workflow/check/result режима.
- Убрать из основных surfaces внутренние identifiers и level-centric поля, если они не помогают пользователю.
- Сохранить debug/runtime данные только там, где они действительно нужны.

## Non-goals

- Не перестраивать вход в задачу.
- Не переписывать wording текущего workflow-шага или check/result flow.
- Не менять storage contracts.

## Decisions

1. Главные metadata нового режима: проект, текущий шаг workflow, checklist/ready state, итог результата.
2. Внутренние поля вроде `taskId`, `levelId`, `levelNumber`, `maxLevel` не должны доминировать в пользовательском интерфейсе.
3. Если техполе пока нужно для отладки, оно должно быть вторичным или скрытым за diagnostic surface.

## Risks

- Если удалить слишком много, пользователь потеряет полезный контекст.
- Если не удалить старый шум, интерфейс останется наполовину в старой модели.

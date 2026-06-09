## Why

После появления canonical `ProjectWorkspace` система всё ещё не становится по-настоящему project-scoped, если onboarding/task layer остаётся плоским. В таком состоянии проект будет существовать как boundary настроек, но не как контекст, в котором пользователь выбирает, открывает и ведёт задачи.

Обновлённый `producer-project` теперь явно требует поэтапность:

1. `ProjectWorkspace` и active project boundary.
2. onboarding/task-слой.
3. workflow-слой как отдельный процесс решения.
4. `workbench` / preview binding.
5. progress invalidation при смене `UI kit`.

Значит, task/onboarding binding должен стать отдельной implement-веткой и не смешиваться ни с workflow, ни с workbench/preview semantics.

## What Changes

- onboarding/task layer начинает работать внутри active project context;
- task catalog, task projection и task runtime больше не трактуются как project-less глобальный поток;
- active project становится обязательной частью входного контракта task/opening flow;
- foundation project boundary начинает влиять на task-layer до workflow- и workbench-специфики.

## Non-goals

- Не закрывать в этой ветке workflow layer.
- Не закрывать в этой ветке `workbench` / preview binding.
- Не вводить progress invalidation при смене project `UI kit`.
- Не описывать project-level `LLM`, `Figma` и `Git/GitHub`.
- Не вводить `Project Roadmap`.

## Capabilities

### Modified Capabilities

- `projects`: active project становится реальной boundary для onboarding/task layer.
- `task`: задача и task projection начинают жить внутри project contract.

## Acceptance Criteria

- task/opening flow явно знает, в каком проекте он выполняется;
- onboarding/task layer не может работать как безымянный глобальный контур вне active project;
- foundation project boundary участвует в task flow до входа в workflow и workbench;
- тестовая часть change явно описывает `static/contract`, `unit`, `integration` и при необходимости browser/e2e слой.

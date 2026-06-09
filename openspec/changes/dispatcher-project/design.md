## Context

В active OpenSpec уже есть две важные рамки:

- `producer-project` задаёт продуктовый смысл `Project` как нового верхнего контекста;
- `producer-architecture-transform` требует, чтобы важные сущности имели явное место в коде, boundary и ownership.

Без отдельного dispatcher project-линия снова рискует разойтись на частные ветки:

- preview/UI kit будет развивать свой локальный `Project`;
- task, workflow и workbench начнут по-разному трактовать project context;
- прогресс и миграция `UI kit` останутся неявным follow-up без ответственного tactical owner.

## Goals

- Дать project-линии отдельного постоянного tactical owner внутри `focus-domain`.
- Развести project-линию на последовательные downstream changes вместо одного размытого giant-implement.
- Синхронизировать domain-owned `Project` с архитектурным требованием явных сущностей и boundary.

## Non-goals

- Не описывать полный roadmap проекта.
- Не уводить `Project` в чисто technical focus.
- Не закрывать сразу LLM/Figma/Git project bindings.

## Decisions

1. `dispatcher-project` отвечает за project-линию целиком, но не делает всё одной веткой.

2. Внутри dispatcher линия разделяется как минимум на пять delivery-срезов:
   - canonical `ProjectWorkspace` и active project context;
   - onboarding/task layer внутри project context;
   - workflow layer внутри project context как процесс решения;
   - отдельный `workbench` / preview binding;
   - тяжёлая migration-операция при смене project `UI kit`.

3. Dispatcher обязан сверяться с `producer-architecture-transform`.
   Это значит:
   - `Project` трактуется как явная product/architecture boundary;
   - project shape не должен плодиться в нескольких несовместимых формах;
   - downstream changes должны оставлять после себя читаемый contract и test traceability.

## Risks / Trade-offs

- Если dispatcher будет слишком широким, он начнёт спорить с `dispatcher-workbench` и `dispatcher-ui-kit`.
  -> Mitigation: считать его owner именно project boundary, а не всех последствий внутри соседних доменов.

- Если dispatcher будет слишком узким, project mode снова распадётся на несвязанные changes.
  -> Mitigation: удерживать в нём workspace, binding и migration rules как постоянную тактическую ответственность project-линии.

## Open Questions

- Когда project-линия созреет для отдельного dispatcher под project-level integrations (`LLM`, `Figma`, `Git/GitHub`).
- Нужно ли после первой волны выделять project selection/navigation в отдельный downstream change или оставить его частью workspace boundary.

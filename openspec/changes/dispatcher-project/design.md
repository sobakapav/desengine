## Context

В active OpenSpec уже есть две важные рамки:

- `producer-project` задаёт продуктовый смысл `Project` как нового верхнего контекста;
- `producer-architecture-transform` требует, чтобы важные сущности имели явное место в коде, boundary и ownership.

Без отдельного dispatcher project-линия снова рискует разойтись на частные ветки:

- preview/UI kit будет развивать свой локальный `Project`;
- component layer, workflow и workbench начнут по-разному трактовать project context;
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
   - component layer внутри project context;
   - workflow layer внутри project context как процесс проектной работы;
   - отдельный locked `workbench` / preview shell;
   - тяжёлая migration-операция при смене project `UI kit`.

3. После foundation/runtime-волн project-линия должна быть проявлена в пользовательском мире отдельными project-facing slices, а не оставаться скрытой внутри Workbench:
   - navigation/page foundation для раздела `Проекты`;
   - project/component work visibility;
   - project config и `UI kit` contract surface;
   - project history/diagnostics surface;
   - read-only workflow/artifact readout.

   Пока текущим приоритетом считаются navigation/page foundation, component work visibility и read-only workflow/artifact readout, потому что именно они помогают удержать основную цепочку `проект -> компоненты -> workflow -> работа`. Project config и history/diagnostics остаются следующей волной.

4. Dispatcher обязан сверяться с `producer-architecture-transform`.
   Это значит:
   - `Project` трактуется как явная product/architecture boundary;
   - project shape не должен плодиться в нескольких несовместимых формах;
   - downstream changes должны оставлять после себя читаемый contract и test traceability.

5. До отдельного producer-level решения dispatcher держит жёсткий текущий приоритет:
   - `проект -> компоненты -> workflow -> работа`;
   - всё, что не помогает выровнять эту цепочку прямо сейчас, считается отложенным.

## Risks / Trade-offs

- Если dispatcher будет слишком широким, он начнёт спорить с `dispatcher-workbench` и `dispatcher-ui-kit`.
  -> Mitigation: считать его owner именно project boundary, а не всех последствий внутри соседних доменов.

- Если dispatcher будет слишком узким, project mode снова распадётся на несвязанные changes.
  -> Mitigation: удерживать в нём workspace, binding и migration rules как постоянную тактическую ответственность project-линии.

## Open Questions

- Когда project-линия созреет для отдельного dispatcher под project-level integrations (`LLM`, `Figma`, `Git/GitHub`).
- После появления раздела `Проекты` нужно ли выделять отдельный tactical owner для project-level content surfaces или current `dispatcher-project` остаётся достаточным центром координации.

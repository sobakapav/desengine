## Context

Task-система уже не является гипотезой: roadmap закреплён под `focus-onboarding`, runtime-поведение задач описано в `openspec/specs/task/spec.md`, а часть guidance-линии использует общий template-context boundary из `openspec/specs/prompt-context/spec.md`. При этом downstream changes по этой теме уже разошлись на implement и fix-ветки разного масштаба.

`dispatcher-tasks` нужен не для описания очередного API, а для удержания task-системы как связного planning-контура.

## Goals

- Удерживать систему задач как отдельную product/runtime линию внутри `focus-onboarding`.
- Явно отделять dispatcher-уровень от concrete implementation changes.
- Фиксировать, где живут наблюдаемые контракты задач и как они трассируются в тестовый слой.

## Non-goals

- Повторно проектировать runtime API задач внутри dispatcher.
- Дублировать delta-spec из capability `task` и смежных capability.
- Сводить все дальнейшие изменения линии в один долгоживущий implement change.

## Decisions

1. `dispatcher-tasks` остаётся активным родительским change для task-системы.
2. Наблюдаемое runtime-поведение задач хранится не в dispatcher, а в capability `task`; связанные контракты, например template/render context для task hints, остаются в профильных capability вроде `prompt-context`.
3. Concrete изменения линии оформляются отдельными child changes:
   - implement: когда меняется task contract, task metadata, task/lab UX-path, progress model, guidance path или тестовая опора;
   - fix: когда устраняется регрессия или локальная ошибка внутри уже заданного task-контракта.
4. Release-трассировка и verification strategy фиксируются на уровне child changes, а не на уровне dispatcher.
5. Для любого behavior-change в этой линии обязательна человеко-понятная тестовая часть: capability/scenarios, уровень проверки, команды запуска, fixtures и traceability.

## Scope Boundaries

В рамки dispatcher входят:

- ownership task-системы;
- связь с roadmap задач онбординга;
- связь со spec-контрактами `task` и смежных capability;
- требования к тестовой опоре downstream changes.

Вне рамок dispatcher остаются:

- конкретная реализация lookup/render/fallback логики каждого child change;
- выбор файлов, API и internal data flow конкретного runtime-изменения;
- пользовательские UX-изменения вне task-контура;
- смена шаблонного движка и install-critical инфраструктуры.

## Risks

- Если dispatcher снова начнёт описывать конкретную реализацию, он потеряет роль устойчивого planning-слоя и будет конфликтовать с child changes.
- Если downstream fixes пойдут мимо dispatcher, task-система потеряет общую release и test traceability.

## Trade-offs

- Более абстрактный dispatcher слабее как технический дизайн-документ, но сильнее как долговременный owner change.
- Перенос runtime-деталей в child changes и capability-spec требует больше ссылочной дисциплины, зато уменьшает дублирование и расхождения.

## Open Questions

- Отдельных открытых вопросов в границах dispatcher сейчас нет; новые runtime-вопросы должны открываться в child `implement`/`fix` changes, а не размывать этот planning change.

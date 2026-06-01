## Context

Линия task hints уже не является гипотезой: roadmap закреплён под `focus-onboarding`, runtime-поведение описано в `openspec/specs/task/spec.md`, а общий template-context boundary выделен в `openspec/specs/prompt-context/spec.md`. При этом downstream changes по этой теме уже разошлись на архивный implement и новые fix-ветки.

`dispatcher-task-hints` нужен не для описания очередного API, а для удержания этой линии как связного planning-контура.

## Goals

- Удерживать task hints как отдельную product/runtime линию внутри `focus-onboarding`.
- Явно отделять dispatcher-уровень от concrete implementation changes.
- Фиксировать, где живут наблюдаемые контракты task hints и как они трассируются в тестовый слой.

## Non-goals

- Повторно проектировать runtime API task hints внутри dispatcher.
- Дублировать delta-spec из capability `task` и `prompt-context`.
- Сводить все дальнейшие изменения линии в один долгоживущий implement change.

## Decisions

1. `dispatcher-task-hints` остаётся активным родительским change для линии task hints.
2. Наблюдаемое runtime-поведение task hints хранится не в dispatcher, а в capability `task`; общий template/render context boundary хранится в capability `prompt-context`.
3. Concrete изменения линии оформляются отдельными child changes:
   - implement: когда меняется механизм, контракт или тестовая опора;
   - fix: когда устраняется регрессия или локальная ошибка внутри уже заданного контракта.
4. Release-трассировка и verification strategy фиксируются на уровне child changes, а не на уровне dispatcher.
5. Для любого behavior-change в этой линии обязательна человеко-понятная тестовая часть: capability/scenarios, уровень проверки, команды запуска, fixtures и traceability.

## Scope Boundaries

В рамки dispatcher входят:

- ownership линии task hints;
- связь с roadmap task hints;
- связь со spec-контрактами `task` и `prompt-context`;
- требования к тестовой опоре downstream changes.

Вне рамок dispatcher остаются:

- конкретная реализация lookup/render/fallback логики;
- выбор файлов, API и internal data flow конкретного runtime-изменения;
- пользовательские UX-изменения вне линии task hints;
- смена шаблонного движка и install-critical инфраструктуры.

## Risks

- Если dispatcher снова начнёт описывать конкретную реализацию, он потеряет роль устойчивого planning-слоя и будет конфликтовать с child changes.
- Если downstream fixes пойдут мимо dispatcher, линия task hints потеряет общую release и test traceability.

## Trade-offs

- Более абстрактный dispatcher слабее как технический дизайн-документ, но сильнее как долговременный owner change.
- Перенос runtime-деталей в child changes и capability-spec требует больше ссылочной дисциплины, зато уменьшает дублирование и расхождения.

## Open Questions

- Отдельных открытых вопросов в границах dispatcher сейчас нет; новые runtime-вопросы должны открываться в child `implement`/`fix` changes, а не размывать этот planning change.

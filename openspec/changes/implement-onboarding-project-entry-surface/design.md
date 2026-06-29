## Context

Этот change закрывает только вход в onboarding-цепочку. Он не переводит сразу весь task runtime на
новый язык, а делает так, чтобы пользователь входил в onboarding через проектный контекст, а не
через старую level-логику.

## Goals

- Сделать project context главным входом в onboarding-задачу.
- Перевести task list и соседние entry surfaces на более project-aware объяснение.
- Сохранить совместимость с текущим task runtime, если он ещё требует legacy level bridge.

## Non-goals

- Не переписывать check/result surfaces в этом change.
- Не переоткрывать общие contracts `projects` и `workflow`.
- Не переделывать весь Workbench.

## Decisions

1. Пользователь должен понимать, из какого проекта он входит в onboarding-работу.
2. Список задач и entry CTA не должны объяснять себя через уровни как основной язык.
3. Legacy task/level runtime может остаться внутренним bridge, но не пользовательской точкой входа.

## Risks

- Если change ограничится только косметическим текстом, пользовательский маршрут не станет яснее.
- Если change залезет в общий project contract, он начнёт дублировать уже принятые project changes.

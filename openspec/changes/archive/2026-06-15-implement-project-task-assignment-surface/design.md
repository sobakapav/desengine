## Контекст

Task actions, prompt history, workbench files и runtime storage уже знают `projectId`, но task catalog и task pages не показывают этого пользователю как отдельный смысловой контракт.

## Решение

1. Ввести отдельный assignment boundary между задачей и проектом, опирающийся на canonical project/runtime слой.

2. Научить task surfaces показывать, какой проект связан с задачей.

3. На странице проекта показать задачи, связанные с этим проектом.

4. Дать пользователю понятные переходы:
   - из проекта в задачу;
   - из задачи в проект.

5. Не смешивать этот change с project config/editor и не превращать его в полную project history wave.

## Границы

- Этот change не меняет Workbench shell как главный owner project settings.
- Этот change не обязан сразу решать массовое управление assignment для многих задач.
- Этот change не должен переопределять workflow/artifact binding, кроме минимальной видимости project/task связи.

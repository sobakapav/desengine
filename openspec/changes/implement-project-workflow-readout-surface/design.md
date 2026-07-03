## Контекст

Project-aware workflow model уже реализован, но наблюдаем только точечно в summary Workbench. Для user-facing project world нужен отдельный read-only surface без переизобретения модели.

## Решение

1. На странице проекта показать read-only срез workflow и artifacts.

2. Переиспользовать существующие projection/model helpers.

3. Объяснить пользователю, как текущий workflow step связан с проектом, компонентными линиями работы и Workbench.

## Границы

- Не вводить интерактивное редактирование workflow.
- Не менять current orchestration и runtime bindings.
- Не смешивать этот change с project history/config pages.

## Контекст

Canonical project config уже описан через `ProjectWorkspace.settings` и `ProjectWorkspace.migration`. Prompt/render context уже знает selected/effective UI kit. Пользовательский слой пока не поднимает это на уровень самостоятельной project configuration page.

## Решение

1. На странице проекта ввести простой config surface с JSON как минимальным способом редактирования.

2. Показать canonical список доступных UI kit'ов и связать его с project settings.

3. Явно объяснить на уровне проекта:
   - какой kit выбран;
   - какой kit effective в runtime;
   - есть ли активная migration;
   - где этот contract влияет на prompt/preview.

4. Не вводить на этой волне сложный визуальный form-builder вместо JSON.

## Границы

- Не превращать change в полную замену Workbench project shell.
- Не переоткрывать low-level migration semantics.
- Не требовать отдельного backend persistence, если browser/project boundary уже достаточен для MVP.

## Контекст

Сейчас глобальная навигация уже существует, но не содержит project entrypoint. Отдельного route-слоя `/projects` и `/projects/[projectId]` тоже нет. При этом canonical project registry уже есть в `lib/project/storage.ts`, а runtime-модель проекта уже стабилизирована через `ProjectWorkspace`.

## Решение

1. Добавить отдельный navigation helper для project routes.

2. Расширить глобальную навигацию новой вкладкой `Проекты`.

3. Ввести самостоятельные user-facing pages:
   - список проектов с чтением registry и active-project состояния;
   - страница конкретного проекта с базовым overview.

4. Переиспользовать существующий project registry и active project boundary.
   Это change не создаёт новый storage contract и не переносит project state в отдельный backend.

5. На странице проекта показать только foundation surface:
   - название и `id`;
   - статус active project;
   - базовые project settings/migration summary;
   - ссылки на следующие user-facing действия.

## Границы

- Не включать в этот change task assignment UI.
- Не включать сюда JSON-редактор проекта и подробный config editor.
- Не переоткрывать логику Workbench project shell, кроме необходимого переиспользования готовых boundary/helper-ов.

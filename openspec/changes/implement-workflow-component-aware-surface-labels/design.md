## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- `ProjectComponent` уже умеет запускать workflow-сессию через `backing task`.
- Но после перехода в Lab и task surfaces пользователь снова видит прежде всего `taskId`, а не тот компонент проекта, ради которого workflow вообще был открыт.
- При этом server-side persistence для `ProjectComponent` пока нет: компонент хранится в browser storage.

## Решение

1. Добавить client-side resolver `taskId -> ProjectComponent`.
   Он читает project-component registry из browser storage и находит компонент по `taskId` внутри известного `projectId`.

2. Применить этот resolver в ключевых user-facing surfaces:
   - `WorkbenchHeader`;
   - экран задачи;
   - карточка задачи в списках.

3. Показывать пользователю component-aware формулировки:
   - над каким компонентом проекта идёт workflow-сессия;
   - что текущий task является backing runtime этого компонента;
   - как вернуться в проект, не теряя смыслового контекста.

4. Не вводить в этом change новую server-side модель component binding.
   Если surface открыт вне project-aware browser context и компонент не найден, интерфейс должен деградировать мягко и оставаться работоспособным.

## Компромиссы

- Task page и task cards не получают полностью server-rendered component labels, потому что canonical component registry пока browser-local.
- Это допустимо для текущей волны: задача change не в том, чтобы решить persistence-архитектуру, а в том, чтобы пользователь перестал терять смысл после входа в workflow.

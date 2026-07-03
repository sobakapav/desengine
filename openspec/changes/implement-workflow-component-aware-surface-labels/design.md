## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- `ProjectComponent` уже умеет запускать project-owned workflow-сессию.
- Но после перехода в downstream workflow/workbench surfaces пользователь снова может увидеть прежде всего внутренний id сессии, а не тот компонент проекта, ради которого workflow вообще был открыт.
- При этом server-side persistence для `ProjectComponent` пока нет: компонент хранится в browser storage.

## Решение

1. Добавить client-side resolver `workflow-session -> ProjectComponent`.
   Он читает project-component registry из browser storage и находит компонент по доступному workflow/workbench контексту внутри известного `projectId`.

2. Применить этот resolver в ключевых user-facing surfaces:
   - `WorkbenchHeader`;
   - workflow readout / session summary;
   - workbench cards и связанные project-facing summaries.

3. Показывать пользователю component-aware формулировки:
   - над каким компонентом проекта идёт workflow-сессия;
   - что текущая workflow/workbench-сессия принадлежит именно этому компоненту;
   - как вернуться в проект, не теряя смыслового контекста.

4. Не вводить в этом change новую server-side модель component binding.
   Если surface открыт вне project-aware browser context и компонент не найден, интерфейс должен деградировать мягко и оставаться работоспособным.

## Компромиссы

- Workflow/workbench surfaces не получают полностью server-rendered component labels, потому что canonical component registry пока browser-local.
- Это допустимо для текущей волны: задача change не в том, чтобы решить persistence-архитектуру, а в том, чтобы пользователь перестал терять смысл после входа в workflow.

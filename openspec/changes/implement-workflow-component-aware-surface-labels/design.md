## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- `ProjectComponent` уже умеет запускать project-owned workflow-сессию.
- Но после перехода в downstream workflow/workbench surfaces пользователь снова может увидеть прежде всего внутренний id сессии, а не тот компонент проекта, ради которого workflow вообще был открыт.
- При этом project component storage ещё не был центром этого change: компонентный смысл должен читаться через canonical project boundary.

## Решение

1. Добавить resolver `workflow-session -> ProjectComponent`.
   Он читает canonical project-component registry и находит компонент по доступному workflow/workbench контексту внутри известного `projectId`.

2. Применить этот resolver в ключевых user-facing surfaces:
   - `WorkbenchHeader`;
   - workflow readout / session summary;
   - workbench cards и связанные project-facing summaries.

3. Показывать пользователю component-aware формулировки:
   - над каким компонентом проекта идёт workflow-сессия;
   - что текущая workflow/workbench-сессия принадлежит именно этому компоненту;
   - как вернуться в проект, не теряя смыслового контекста.

4. Не вводить в этом change новую отдельную модель component binding.
   Если surface открыт вне project-aware context и компонент не найден, интерфейс должен деградировать мягко и оставаться работоспособным.

## Компромиссы

- Workflow/workbench surfaces могут временно зависеть от текущей project context assembly, но не должны возвращаться к browser-local registry как к отдельному источнику истины.
- Это допустимо для текущей волны: задача change не в том, чтобы переоткрывать storage-архитектуру, а в том, чтобы пользователь перестал терять смысл после входа в workflow.

## Why

Нужен исполнительский change для реализации задачи parent owner.

## What Changes

- Убрать `Task` из product-пути проекта и перевести проектную страницу в статус главной рабочей поверхности.
- Ввести project-owned session/state для работы над проектом.
- Перенести фокус работы с `task -> component runtime` на `project -> active focus component`.
- Убрать task-лексики из project page, project workflow readout и project history surface.
- Перевести legacy index-входы `/tasks` и `/lab` в redirect на `/projects`.

## Impact

- Пользователь начинает работать над проектом прямо из `/projects/<projectId>`.
- Компоненты проекта перестают быть входом в отдельные task runtime'ы.
- Project workflow и история становятся наблюдаемыми прямо через project surface.

## Capabilities

### Modified Capabilities
- `projects`
- `workflow`
- `navigation`

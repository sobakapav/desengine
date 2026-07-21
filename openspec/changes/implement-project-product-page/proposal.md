## Why

Нужен исполнительский change для реализации постановки parent owner.

## What Changes

- Убрать legacy runtime из product-пути проекта и перевести проектную страницу в статус главной рабочей поверхности.
- Ввести project-owned session/state для работы над проектом.
- Перенести работу с `component runtime` на `project -> component lines -> workflow`.
- Убрать legacy-лексики из project page, project workflow readout и project history surface.
- Перевести legacy pre-project входы в redirect на `/projects`.

## Impact

- Пользователь начинает работать над проектом прямо из `/projects/<projectId>`.
- Компоненты проекта перестают быть входом в отдельные legacy runtime'ы.
- Project workflow и история становятся наблюдаемыми прямо через project surface.

## Capabilities

### Modified Capabilities
- `projects`
- `workflow`
- `navigation`

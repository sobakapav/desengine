## Why

Нужен исполнительский change для реализации задачи parent owner.

## What Changes

- Реализовать: Выделить project-scoped shell текущего Workbench: вынести project loading/settings/migration UI и project-aware rehydrate/select/create flow в отдельные модули, чтобы Workbench стал явным consumer project scope вместо лабораторного монолита.

## Impact

- Изменение закрывает конкретный исполнительский срез в рамках текущего parent owner.

## Why

Нужен исполнительский change для реализации задачи parent owner.

## What Changes

- Реализовать: Сделать project/workbench workflow surfaces component-aware: показывать, над каким `ProjectComponent` идёт workflow-сессия, и не сводить пользовательский контекст только к внутреннему id сессии.

## Impact

- Изменение закрывает конкретный исполнительский срез в рамках текущего parent owner.

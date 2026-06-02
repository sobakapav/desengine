## Why

В Sandpack preview подтверждён runtime-дефект: компонент, который использует `@/components/ui/alert-dialog`, может падать с ошибкой вида `(0, import_react_slot.createSlot) is not a function`.

Корень проблемы находится не в самом компоненте задачи, а в dependency graph preview-проекта. Builder подставляет semver-диапазоны из корневого `package.json`, и Sandpack при повторной установке может собрать несовместимый набор `@radix-ui/*` пакетов.

## What Changes

- Зафиксировать для Sandpack preview exact installed версии runtime-зависимостей вместо плавающих диапазонов.
- Распространить это правило на базовые React/Tailwind зависимости и на UI kit dependency map.
- Добавить unit-регрессию на exact version contract для shadcn/Radix preview runtime.
- Зафиксировать новый контракт в OpenSpec `task`.

## Impact

- Preview не должен дрейфовать на несовместимый набор `@radix-ui/*` пакетов при пересборке виртуального проекта.
- Компоненты с `AlertDialog` и соседними Radix primitives должны использовать тот же согласованный version set, что и рабочая локальная установка.

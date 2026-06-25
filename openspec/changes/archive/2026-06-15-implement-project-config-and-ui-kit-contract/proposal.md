## Why

Project settings уже существуют как canonical contract, а prompt/preview слой уже читает `project.settings.uiKitId` и effective UI kit. Но пользователь всё ещё не может работать с этим как с проектной конфигурацией:

- `uiKitId` живёт в Workbench, а не на странице проекта;
- нет простого project-level config surface, хотя для начального этапа достаточно JSON;
- нельзя явно прочитать и отредактировать project config вне task flow;
- связка `проект -> ui kit -> prompt templates -> preview` существует в коде, но почти не проявлена в пользовательском мире.

## What Changes

- Поднять project-level config surface на странице проекта.
- Дать пользователю простой JSON-редактор project config как первый конфигурационный контракт.
- Показать и редактировать `uiKitId` через canonical список доступных kit'ов.
- Явно проявить, что project `uiKit` влияет:
  - на project settings;
  - на preview/runtime contract;
  - на prompt templates и render context.
- Показать пользователю effective UI kit и migration status на уровне проекта.

## Impact

- Конфигурация проекта перестаёт быть спрятанной в узком рабочем контуре задачи.
- Следующие волны смогут добавлять более богатую project history и diagnostics уже поверх явного project config surface.

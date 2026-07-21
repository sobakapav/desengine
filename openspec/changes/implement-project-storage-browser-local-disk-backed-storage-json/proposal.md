## Why

Текущий project storage живёт в browser-local `localStorage`. Для реального продукта этого уже недостаточно:

- проект нельзя положить в выбранное пользователем место на машине сервера;
- нельзя подключить уже существующий внешний проект с диска;
- состояние проекта слишком привязано к конкретному браузеру;
- autosave не даёт наблюдаемого файлового следа в понятной структуре каталогов;
- active project materials всё ещё местами несут legacy runtime-следы, хотя проект уже должен быть самостоятельной верхней сущностью.

Нужна новая project-wave, которая переведёт хранилище в disk-backed режим без БД и без закрытого бинарного формата: проект должен жить в читаемых JSON-файлах и подкаталогах, а product surface должен честно работать с абсолютным server-side path.

## What Changes

- Перевести canonical project storage со старого browser-local persistence на disk-backed storage adapter на машине сервера.
- Ввести user-facing flow создания проекта с явным `server path`.
- Ввести user-facing flow подключения внешнего проекта с диска по указанному пути.
- Сохранять project state автоматически в фоне после project-facing изменений.
- Зафиксировать on-disk project layout на основе JSON-файлов и читаемой системы каталогов без баз данных.
- Пересобрать project registry, active project context, project page и import/export surfaces вокруг server-backed storage.
- Убрать legacy runtime-следы из active project materials и из active OpenSpec changes, где они ещё описывают живой project path.

## Impact

- `projects`
- `storage-adapter`
- `project-api`
- `workflow`
- active project-facing changes/specs, где ещё остались legacy runtime-следы

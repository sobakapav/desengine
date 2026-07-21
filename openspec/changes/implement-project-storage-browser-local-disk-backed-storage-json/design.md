## Контекст

Родительский `dispatcher-project` уже закрепил `Project` как основную доменную границу. В коде при этом project storage исторически был browser-local:

- registry и active project читаются через `localStorage`;
- компоненты, project session и activity history тоже живут в browser-local ключах;
- product surface честно сообщал, что project пока хранится локально в браузере;
- import/export manifest уже есть, но это не заменяет реальное проектное хранилище.

Одновременно active project materials частично уже вычищены из legacy runtime-лексики, но в active OpenSpec и связанных текстах ещё встречаются остаточные следы старого workflow/task-слоя, как будто project path всё ещё опирается на него.

## Решение

### 1. Project storage становится disk-backed adapter

Вместо старого browser-local project storage вводится server-side adapter, который работает с файлами на диске машины сервера.

Adapter отвечает за:

- project registry;
- active project selection;
- чтение и запись `ProjectWorkspace`;
- чтение и запись `ProjectComponent`;
- project session;
- project history activities;
- export/import manifest на основе того же canonical project state.

### 2. Пользователь задаёт server path при создании проекта

Создание проекта больше не ограничивается названием и `id`. Пользователь явно указывает абсолютный путь на машине сервера, где будет жить проект.

Первая волна не требует системного file picker. Достаточно явного текстового поля server path с валидацией и человекочитаемыми ошибками.

### 3. Пользователь может подключить внешний проект с диска

На странице `/projects` появляется отдельный flow подключения проекта по существующему пути.

Если по пути уже лежит desengine project в canonical disk format, система:

- читает его metadata;
- добавляет или обновляет запись в registry;
- позволяет открыть проект как обычный project surface.

### 4. On-disk формат остаётся простым и читаемым

Первая волна использует только JSON-файлы, обычные текстовые файлы и каталоги.

Базовая структура:

- корневой каталог проекта;
- `project.json` для canonical `ProjectWorkspace`;
- `components/` для component JSON-файлов;
- `workspace/session.json` для project session;
- `workspace/activities.json` для project history;
- `artifacts/` для project-owned exported/readable materials, если surface уже что-то материализует;
- дополнительные JSON-файлы допускаются только если они остаются человекочитаемыми и не требуют БД.

### 5. Сохранение идёт автоматически в фоне

После user-facing изменений система не ждёт отдельного действия `Сохранить проект`.

Autosave означает:

- project create/save/update flows пишут изменения на диск сразу после успешного server action;
- UI получает success/error feedback, но не строится вокруг ручной кнопки общего сохранения;
- browser-local state не считается source of truth и не сохраняется как compatibility fallback.

### 6. Browser-local storage убирается из active project path

Project page, registry, config, component flows и project product surfaces больше не должны опираться на `window.localStorage` как canonical backend.

Допустимы только временные client drafts формы до server submit.

### 7. Legacy runtime-следы вычищаются из active project materials

В рамках этого change вычищаются только active материалы, которые описывают project path как живую систему:

- active specs;
- active project-related changes;
- project-facing user texts;
- active project/runtime boundary explanations.

Архивные changes не переписываются.

## Компромиссы

- Первая волна сознательно использует ввод пути строкой, а не системный file chooser.
- Первая волна не вводит БД, индексацию, background daemon или file watching.
- Первая волна не решает multi-user locking; canonical модель остаётся single-writer server-side.

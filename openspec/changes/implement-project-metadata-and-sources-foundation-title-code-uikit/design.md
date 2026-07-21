## Контекст

`dispatcher-project` уже вывел `Project` в роль главной рабочей единицы продукта. Сейчас в проектном слое уже есть:

- базовая сущность `ProjectWorkspace`;
- canonical disk-backed storage;
- project config c `title/id/uiKitId`;
- component/workflow path;
- manifest, artifact library и prompt brief.

Но этого недостаточно для реального product context. Пользователь уже формулирует проект не только как runtime shell, а как контейнер:

- метаданных;
- design sources;
- структурной карты системы;
- архива аналитики и ТЗ.

При этом producer-line уже упоминала будущий `Figma` binding, но держала его отложенным до стабилизации основной project chain. Значит, в этой волне нужен не полный import adapter, а более узкий foundation для project sources.

## Решение

### 1. Project metadata становится отдельным contract-слоем

Минимальный обязательный metadata contract проекта:

- `title` — человекочитаемое имя проекта;
- `code` — короткий стабильный код проекта, пригодный для имени каталога, префиксов и внешних связей;
- `uiKitId` — выбранный UI kit из canonical списка.

`id` не исчезает, но перестаёт быть единственной заменой project code. Для продуктового и файлового слоя `code` считается отдельным значимым полем, даже если в первой волне он может совпадать с `id`.

### 2. Project sources живут в отдельном foundation-слое

В проекте появляется отдельный sources-layer, который хранит:

- `figmaFiles[]`;
- `componentGraph`;
- `screenGraph`;
- `archive`.

Этот слой принадлежит проекту целиком и не должен растворяться в workflow artifacts, prompt brief или runtime diagnostics.

### 3. `Figma files` пока фиксируются как project-level source registry

Первая волна не реализует полноценный Figma import/sync. Она фиксирует только project-owned список Figma-файлов:

- file key / url / title;
- опциональный статус подключения;
- опциональные notes;
- связь с проектом как canonical source.

Этого достаточно, чтобы downstream waves перестали изобретать свои локальные способы привязки Figma к проекту.

### 4. `Component graph` становится canonical картой проектных сущностей

Компоненты как рабочие объекты уже существуют, но не существует их явной структурной карты.

`componentGraph` должен позволять хранить:

- nodes компонентов;
- edges зависимостей, композиции или принадлежности;
- минимальные metadata node/edge, достаточные для чтения человеком и машиной.

Первая волна не обещает сложный visual editor. Нужен canonical data contract.

### 5. `Screen graph` является подвидом component graph

Экран не вводится как полностью отдельная ветка модели. Вместо этого:

- `screenGraph` считается отдельным срезом project structure;
- semantic model наследует общую graph-логику;
- screens могут ссылаться на components, composition zones и navigation edges.

Это не workflow screen composition и не UI layout editor. Это project-owned structural map.

### 6. Архив аналитики и ТЗ фиксируется как file-based document archive

Пользователь просит не сложную knowledge system, а пока просто набор файлов. Поэтому первая волна вводит простой `archive`:

- каталог файлов внутри проекта;
- readable formats;
- без обязательной БД;
- без сложной taxonomy в первой волне.

Минимальные категории:

- `analytics/`
- `requirements/`

Но contract должен позволять добавлять новые document groups позже без пересборки storage model.

### 7. Disk-backed layout расширяется новыми project-owned каталогами

Поверх уже существующего project storage вводятся понятные каталоги:

- `metadata/`
- `sources/figma/`
- `structure/`
- `archive/analytics/`
- `archive/requirements/`

Допускается эквивалентная компактная раскладка через несколько JSON-файлов, если она остаётся человекочитаемой и не прячет смысл в непрозрачных blob-структурах.

### 8. Manifest и project surface знают об этих данных, но первая волна не обязана полностью материализовать UI

Новая модель должна быть совместима с:

- project manifest;
- project page;
- future import/export flows.

Но первая волна не обязана сразу сделать:

- полноценный document browser;
- graph editor;
- Figma sync UI.

Достаточно зафиксировать contract, storage layout и минимальные product-facing read/write surfaces.

## Компромиссы

- `Figma files` в этой волне являются registry источников, а не import engine.
- `componentGraph` и `screenGraph` в этой волне являются canonical data, а не обязательным visual editor.
- document archive пока остаётся простым file set без сильной schema-типизации каждого документа.
- не решаются sync, diff, versioning и collaborative editing.

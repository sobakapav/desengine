## Why

Текущий `Project` уже умеет быть рабочим контейнером: у него есть `title`, `id`, `uiKitId`, компоненты, workflow, manifest и file-based storage. Но как product entity он всё ещё слишком узок:

- у проекта нет явной модели project metadata beyond `title/id/uiKit`;
- нет project-level списка `Figma`-источников;
- нет canonical графа компонентов;
- нет canonical графа экранов как особого вида project structure;
- нет project-owned архива аналитики, ТЗ и похожих документов как простого file set;
- всё это приходится держать в голове, во внешних папках или в несвязанных документах.

Пользователь уже явно сформулировал следующую волну проекта: нужны проектные metadata и sources, которые живут вместе с проектом и читаются как часть его contract. Это не roadmap и не полный integration layer, а foundation-слой для следующей продуктовой работы.

## What Changes

- Добавить foundation-модель project metadata:
  - `title`;
  - `code`;
  - `uiKitId`.
- Зафиксировать project-level archive как простой набор файлов для:
  - аналитики;
  - технических заданий;
  - других проектных документов следующих волн.
- Зафиксировать project-level `Figma files` как список источников дизайна, принадлежащих проекту.
- Зафиксировать canonical `component graph`.
- Зафиксировать canonical `screen graph` как подвид component graph, а не отдельную несвязанную сущность.
- Встроить эти данные в file-based disk-backed project storage и product-facing contract проекта.
- Подготовить downstream почву для будущих import/sync/editor waves, не реализуя их сейчас.

## Impact

- `projects`
- `artifacts`
- `project-manifest`
- `storage-adapter`
- новый capability-level contract для project metadata/sources

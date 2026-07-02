## 1. Спецификация и контракты

- [x] 1.1 Заполнить proposal/design/handoff этого change по product-facing логике.
- [x] 1.2 Добавить новый capability `project-manifest` с требованиями к формату, импорту и экспорту.
- [x] 1.3 Добавить новый capability `project-api` с требованиями к внешнему API вокруг project-owned сущностей.
- [x] 1.4 Обновить `projects`, `workflow`, `artifacts`, `prompt-context` и `storage-adapter` под продуктовую ценность новых границ.

## 2. Первая пользовательская волна

- [x] 2.1 Реализовать manifest-модель проекта и сериализацию в `lib/project/**`.
- [x] 2.2 Реализовать browser-local export/import project manifest без смены install-critical стека.
- [x] 2.3 Добавить project API foundation для чтения и записи manifest.
- [x] 2.4 Показать manifest/import-export на project surface как явный пользовательский инструмент.

## 3. Product-facing смысл модулей

- [x] 3.1 Добавить на project surface явный workflow template/readout слой как recipe работы, а не только статус.
- [x] 3.2 Добавить artifact library на project page как наблюдаемый проектный материал.
- [x] 3.3 Добавить prompt brief surface, который связан с canonical prompt context.

## 4. Проверка и следы

- [x] 4.1 Обновить unit/source-contract тесты для manifest/API/project surfaces.
- [x] 4.2 Обновить traceability и coverage-plan, если часть волн останется отложенной.
- [x] 4.3 Подготовить change к внешней verification-проверке через `npm run test:unit` и `npm run test:traceability`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `project-manifest`: экспорт и импорт переносимого проекта.
- `project-api`: API публикует project-owned сущности как внешний контракт.
- `projects`: пользователь видит manifest, artifacts, workflow template и prompt brief на странице проекта.
- `workflow`: workflow становится reusable recipe/template.
- `artifacts`: проект показывает явную библиотеку рабочих материалов.
- `prompt-context`: prompt brief входит в canonical context boundary.
- `storage-adapter`: import/export не зависят от прямого browser-local чтения как единственного контракта.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен.
- integration: желателен для API foundation, если появятся server route handlers.
- component/browser: по возможности для user-facing import/export surface.
- e2e smoke: можно отложить, если unit/source contracts достаточно доказывают первую волну.

Команды запуска:
- `npm run test:unit -- test/unit/project-manifest.test.ts test/unit/project-manifest-foundation.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- unit/source-contract слои должны обходиться без live credentials;
- если будет нужен browser-level import/export smoke, использовать локальные fixture manifest-файлы.

## Tasks

- [x] 1. Обновить OpenSpec-контракт проекта под metadata and sources foundation.
- [x] 2. Расширить canonical project model полями `title/code/uiKitId` и project-owned sources/archive contract.
- [x] 3. Зафиксировать file-based storage layout для metadata, Figma files, component graph, screen graph и document archive.
- [x] 4. Подготовить project manifest и project-facing surfaces к чтению новой модели.
- [x] 5. Обновить unit/source-contract и traceability под новую project model.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios:
  - `projects`: project config включает `title`, `code`, `uiKitId`, `Figma files`, structure graphs и document archive.
  - `artifacts`: archive files читаются как project-owned материалы.
  - `project-manifest`: manifest может нести metadata/sources summary проекта.
  - `storage-adapter`: disk-backed storage хранит новые project-owned data blocks без БД.
  - `project-sources`: проект хранит design sources и structural maps как canonical contract.
- [x] Выбрать уровень проверки:
  - static/contract;
  - unit;
  - component/browser не обязателен в первой волне;
  - integration/e2e smoke можно отложить, если surface останется минимальным.
- [x] Добавить или обновить тесты:
  - unit/source-contract для project metadata contract;
  - unit/source-contract для file-based sources/archive layout;
  - unit/source-contract для manifest/project surface integration новой модели.
- [x] Зафиксировать команду проверки:
  - `npm run test:unit -- project`
  - `npm run test:traceability`
- [x] Описать mock/fixture-данные и live credentials, если нужны:
  - использовать временные project dirs и JSON/file fixtures;
  - fixture проекта должен включать `code`, `figmaFiles`, `componentGraph`, `screenGraph`, `archive`;
  - live credentials не требуются, потому что Figma sync/import engine в эту волну не входит.

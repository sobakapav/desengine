## Requirements

### Requirement: Project storage доступен через adapter boundary

Система SHALL читать и писать project-scoped данные через storage adapter, а не через разрозненные прямые storage-вызовы.

#### Scenario: Runtime читает активный проект
- **WHEN** project runtime требует active project
- **THEN** он обращается к project storage adapter
- **AND** не зависит от конкретного backend хранения

#### Scenario: Storage backend использует disk-backed server path
- **WHEN** пользователь работает с проектом в MVP
- **THEN** adapter хранит canonical project state на диске машины сервера
- **AND** физический формат остаётся человекочитаемым через JSON-файлы и каталоги
- **AND** future cloud/electron storage не требует переписывать project/workflow callers

#### Scenario: Пользователь задаёт path нового проекта
- **WHEN** пользователь создаёт новый проект
- **THEN** storage adapter принимает абсолютный server path
- **AND** создаёт canonical disk layout вне папки продукта

#### Scenario: Пользователь подключает внешний проект с диска
- **WHEN** пользователь указывает server path уже существующего проекта
- **THEN** storage adapter читает canonical project files из этого каталога
- **AND** добавляет проект в registry без копирования в папку продукта

### Requirement: Storage adapter обслуживает portable project contract

Система SHALL использовать storage boundary не только для локального persistence, но и для import/export переносимого project contract.

#### Scenario: Runtime экспортирует manifest через adapter boundary
- **WHEN** система формирует project manifest
- **THEN** она читает project-owned данные через storage adapter
- **AND** внешний manifest не зависит от знания внутренних disk layout keys или любых legacy storage keys

#### Scenario: Runtime импортирует manifest через adapter boundary
- **WHEN** пользователь загружает manifest проекта
- **THEN** storage adapter принимает portable project contract и переводит его в canonical project state
- **AND** смена backend хранения не требует переписывать сам пользовательский import/export contract

## MODIFIED Requirements

### Requirement: Release оркестрирует delivery-матрицу, не подменяя dispatcher

Система SHALL при закрытии release-linked implement/fix changes поддерживать пользовательский журнал релиза через `release-notes.md`, не ломая тактическое подчинение этих changes их parent dispatcher.

#### Scenario: Разработчик закрывает release-linked implement/fix change
- **GIVEN** implement или fix change ссылается на active release через `release_ref`
- **AND** у change есть заполненный `artifacts/release-note.md`
- **WHEN** разработчик запускает `npm run os:close -- <implement-or-fix-change>`
- **THEN** инструмент добавляет user-facing запись этого change в `openspec/changes/<release>/release-notes.md`
- **AND** только после этого продолжает архивирование change

#### Scenario: Release notes уже содержат запись о change
- **GIVEN** release-linked implement или fix уже упомянут в `release-notes.md` релиза
- **WHEN** close-path повторно пытается синхронизировать release note
- **THEN** инструмент не создаёт дубликат записи
- **AND** существующее пользовательское описание релиза сохраняется без повторов

## MODIFIED Requirements

### Requirement: Список релизов OpenSpec показывает только актуальные changes

Система SHALL в команде `npm run os:r` показывать только активные release changes и только активный состав поставки по полю `release_ref`.

#### Scenario: Разработчик выводит список релизов
- **WHEN** разработчик запускает `npm run os:r`
- **THEN** в вывод попадают только changes из `openspec/changes/*`
- **AND** archived changes из `openspec/changes/archive/*` не печатаются ни как release, ни как элементы состава

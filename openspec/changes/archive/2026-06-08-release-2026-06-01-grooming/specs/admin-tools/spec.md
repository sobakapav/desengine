## MODIFIED Requirements

### Requirement: Release оркестрирует delivery-матрицу, не подменяя dispatcher

Система SHALL позволять release change управлять составом поставки через связь `release_ref`, сохраняя тактическое подчинение исполнительских changes их parent dispatcher.

#### Scenario: Grooming-wave объединяется общим release change через `release_ref`
- **GIVEN** существует release change `release-2026-06-01-grooming`
- **AND** downstream changes принадлежат своему dispatcher-контуром
- **WHEN** эти downstream changes включаются в одну активную grooming-волну
- **THEN** каждый из них может ссылаться на `release-2026-06-01-grooming` через metadata-поле `release_ref`
- **AND** их `parent_change` не заменяется на release change

## MODIFIED Requirements

### Requirement: Release оркестрирует delivery-матрицу, не подменяя dispatcher

Система SHALL позволять release change управлять составом поставки через связь `release_ref`, сохраняя тактическое подчинение исполнительских changes их parent dispatcher.

#### Scenario: Ночная integration-wave объединяется общим release change через `release_ref`
- **GIVEN** существует release change `release-2026-05-25-night`
- **AND** downstream changes принадлежат своему dispatcher-контуром
- **WHEN** эти downstream changes включаются в одну поставочную волну
- **THEN** каждый из них может ссылаться на `release-2026-05-25-night` через metadata-поле `release_ref`
- **AND** их `parent_change` не заменяется на release change

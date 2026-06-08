## MODIFIED Requirements

### Requirement: Release оркестрирует delivery-матрицу, не подменяя dispatcher

Система SHALL позволять release change управлять составом поставки через связь `release_ref`, сохраняя тактическое подчинение исполнительских changes их parent dispatcher.

#### Scenario: Разработчик пытается закрыть release с незакрытым составом
- **GIVEN** в active слое остаётся хотя бы один implement/fix change с `release_ref=<release-change>`
- **WHEN** соответствующий release уже архивирован или исключён из active слоя
- **THEN** traceability-проверка завершается ошибкой
- **AND** ошибка явно требует сначала закрыть или перепривязать весь active состав этого release

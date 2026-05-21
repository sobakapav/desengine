## MODIFIED Requirements

### Requirement: Размер файлов и функций ограничен стандартными soft-limit

Система разработки SHALL применять явные soft-limit для размера изменяемых файлов и функций, чтобы код сохранял локальную читаемость и предсказуемость ревью.

#### Scenario: Cleanup закрывает временный waiver production-файла
- **WHEN** change создаётся специально для закрытия readability waiver изменяемого production-файла
- **THEN** файл разделяется на логические модули или helpers
- **AND** waiver удаляется из активного `tools/quality-text/waivers.json`
- **AND** `npm run quality:text` проходит без активного нарушения для этого файла

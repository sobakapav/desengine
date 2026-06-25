## MODIFIED Requirements

### Requirement: Пользователь видит workflow points внутри Workbench

#### Scenario: Пользователь выбирает workflow point как production focus
- **WHEN** пользователь выбирает пункт workflow в Workbench
- **THEN** surface помечает этот пункт как текущий production focus
- **AND** если для пункта доступен связанный файл, Workbench переводит редактор на этот файл

#### Scenario: Workflow point без доступного файла не имитирует действие
- **WHEN** пункт workflow ещё не имеет доступного file target в текущем runtime
- **THEN** surface всё ещё показывает его пользователю
- **AND** не делает вид, что может открыть несуществующий рабочий файл

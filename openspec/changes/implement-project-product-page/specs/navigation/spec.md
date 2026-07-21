## MODIFIED Requirements

### Requirement: Левая часть Navigation перечисляет канонические entry point'ы
Система SHALL в левой части `Navigation` показывать ссылки `home`, `уровни`, `проекты`, `config`, `help`.

#### Scenario: Пользователь смотрит на левую часть Navigation
- **WHEN** product-shell страница отрисована
- **THEN** в левой части `Navigation` видны ссылки `home`, `уровни`, `проекты`, `config`, `help`
- **AND** каждая ссылка ведёт на соответствующий канонический top-level маршрут

### Requirement: Legacy pre-project index routes перенаправляют в проекты
Система SHALL перенаправлять старые index-входы прежнего рабочего контура в раздел проектов, чтобы project surface оставался главным входом в работу.

#### Scenario: Пользователь открывает старый index route
- **WHEN** пользователь открывает legacy index route прежнего рабочего контура
- **THEN** система перенаправляет его в `/projects`
- **AND** не показывает эти index routes как канонические product-shell entry point'ы

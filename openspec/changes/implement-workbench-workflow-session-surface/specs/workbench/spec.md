## MODIFIED Requirements

### Requirement: Runtime surface может показать текущий workflow step через Workbench

#### Scenario: Пользователь видит Workbench как workflow-session surface
- **WHEN** пользователь открывает рабочую поверхность image-to-component задачи
- **THEN** Workbench показывает coordinator step `Работаем над workflow` как главный режим работы
- **AND** surface больше не описывает текущую работу только через язык одного уровня

#### Scenario: Пользователь видит workflow points внутри Workbench
- **WHEN** Workbench рендерит текущую workflow-сессию
- **THEN** пользователь видит каталог workflow-пунктов как часть рабочей поверхности
- **AND** каждый пункт показывает хотя бы свой заголовок и текущий статус
- **AND** этот каталог не требует отдельного hidden runtime state вне workflow projection

#### Scenario: Preview подан как главный render-center workflow
- **WHEN** пользователь работает в Workbench над компонентом по картинке
- **THEN** preview-зона объясняется как главный результирующий рендер workflow
- **AND** код, промпты и project settings читаются как supporting surface вокруг этого render-center

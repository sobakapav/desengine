## Requirements

### Requirement: Workbench имеет definition, instance и surface-проявление

Система SHALL описывать рабочую поверхность через `WorkbenchDefinition` и `WorkbenchInstance`.

#### Scenario: Lab workbench регистрируется как definition
- **WHEN** runtime открывает текущий lab workbench
- **THEN** он может определить `WorkbenchDefinition`
- **AND** definition содержит profile `level-lab`, поддерживаемый task type, workflow step kind и список tools
- **AND** текущий lab workbench использует definition `lab-component-workbench`

#### Scenario: WorkbenchInstance связан с project/task/workflow step
- **WHEN** runtime строит projection текущей lab task
- **THEN** он создаёт `WorkbenchInstance`
- **AND** instance содержит `projectId`, `taskId`, `workflowStepId` и `definitionId`
- **AND** workbench input contract читает `ProjectWorkspace.settings` как часть project boundary текущего active project
- **AND** workflow step может ссылаться на этот instance через `runtimeBindings.workbenchInstanceIds`
- **AND** workbench contract не требует жёсткого `1:1` между workflow step и `WorkbenchInstance`

#### Scenario: Runtime surface показывает definition и рабочую связку
- **WHEN** пользователь открывает текущую рабочую поверхность
- **THEN** surface может показать `WorkbenchDefinition.title`, `profileId` и `WorkbenchInstance.id`
- **AND** surface явно читает связку `project -> task -> workflow step -> workbench`
- **AND** проявление Workbench не остаётся только foundation-структурой без user-facing следа

#### Scenario: Workbench state сериализуется
- **WHEN** runtime сохраняет или передаёт состояние Workbench
- **THEN** state представлен JSON-сериализуемым envelope с `version` и `value`
- **AND** несериализуемые значения отклоняются на boundary

### Requirement: Workbench показывает workflow-сессию как пользовательскую поверхность

Система SHALL позволять пользователю читать Workbench как workflow-session surface, где preview является центром результата, а workflow points остаются видимой частью рабочей модели.

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

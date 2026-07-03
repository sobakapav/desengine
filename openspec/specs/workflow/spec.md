## Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через `WorkflowInstance` и `WorkflowStepInstance`.

#### Scenario: Workflow definition описывает тип проектной операции
- **WHEN** система публикует workflow в product-facing или runtime-facing каталоге
- **THEN** он представлен через `WorkflowDefinition`
- **AND** definition содержит `operationFamily`, `subjectKinds`, `input requirements`, `producedArtifacts` и `stepDefinitions`
- **AND** workflow не сводится к одному жёстко зашитому recipe проекта

#### Scenario: Workflow run принадлежит проекту и конкретному предмету работы
- **WHEN** пользователь запускает workflow
- **THEN** система создаёт `WorkflowRun` внутри проекта
- **AND** run явно знает project context и свой `subject`
- **AND** subject может быть не только `component`, но и другим допустимым scope проектной работы

#### Scenario: Workflow definition поддерживает альтернативные и опциональные inputs
- **WHEN** workflow может стартовать от разных входов или с частичным project scope
- **THEN** definition умеет различать `all-of`, `one-of` и `optional` input requirements
- **AND** система не притворяется, будто все входы всегда обязательны одновременно

#### Scenario: Workflow step принадлежит проекту
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** каждый `WorkflowStepInstance` принадлежит этому `projectId`
- **AND** входные и выходные данные шага описаны через artifacts
- **AND** пользователь читает шаг как часть проектной работы

#### Scenario: Runtime строит coordinator step для работы над workflow целиком
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** текущим `WorkflowStepInstance` становится coordinator step `Работаем над workflow`
- **AND** этот step получает project-aware runtime bindings
- **AND** coordinator step не требует отдельной пользовательской сущности вне проекта

#### Scenario: Runtime публикует catalog of workflow points для image-to-component workflow
- **WHEN** runtime строит workflow projection создания React-компонента по картинке
- **THEN** projection содержит workflow points для базового компонентного набора артефактов
- **AND** среди них есть пункты для базового компонента из UI kit, стилизации, mock-данных, props-контракта и Storybook-сценариев
- **AND** эти points доступны как часть единого workflow surface, а не как скрытая внутренняя техническая структура

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL давать read-only доступ к project-owned workflow surface и использовать его как основной способ объяснить пользователю текущую работу над проектом.

#### Scenario: Пользователь видит project-owned workflow прямо на странице проекта
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит workflow проекта как наблюдаемую сущность с этапами, активными линиями работы и последней активностью
- **AND** readout не требует знания внутренних runtime-деталей, чтобы понять текущее состояние
- **AND** project page остаётся главной поверхностью наблюдения за workflow

#### Scenario: Пользователь видит workflow template проекта
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит выбранный workflow template как reusable recipe
- **AND** template объясняет последовательность проектной работы, а не только текущий технический статус

#### Scenario: Пользователь запускает проектный workflow по конкретному компоненту
- **WHEN** пользователь открывает `/projects/<projectId>`
- **AND** у проекта есть `ProjectComponent`
- **AND** пользователь выбирает действие `Взять в работу`
- **THEN** workflow проекта запускает линию работы по выбранному компоненту
- **AND** project page показывает этот компонент как часть активной проектной работы
- **AND** пользователь не покидает project surface ради другого рабочего маршрута

#### Scenario: Пользователь возвращает готовый компонент в активный workflow
- **WHEN** компонент уже был отмечен как готовый внутри проекта
- **AND** пользователь снова выбирает действие `Вернуть в работу`
- **THEN** workflow возвращает этот компонент в активную работу проекта
- **AND** такой возврат отражается прямо в project readout и истории работы

### Requirement: Workflow может материализовать project-aware workbench shell

Система SHALL позволять workflow публиковать workbench shell как связанную рабочую поверхность проекта.

#### Scenario: Workflow материализует workbench shell для project-owned subject
- **WHEN** у проекта есть workflow context и выбранный `subject`
- **THEN** система может создать или показать `WorkbenchSession`, связанную с тем же `project` и тем же `subject`
- **AND** сессия содержит ссылку на workflow, который её материализовал
- **AND** пользователь читает workbench как продолжение project-owned workflow, а не как отдельный скрытый runtime

#### Scenario: Workflow открывает только locked workbench shell первой волны
- **WHEN** пользователь открывает workbench из workflow-связанной поверхности проекта
- **THEN** система показывает generic workbench shell в locked-режиме
- **AND** workflow не обещает немедленный допуск к реальной работе внутри этого shell

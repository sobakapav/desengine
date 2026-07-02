## Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через `WorkflowInstance` и `WorkflowStepInstance`.

#### Scenario: Lab level является workflow step
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** текущий уровень может быть представлен как `WorkflowStepInstance`
- **AND** `WorkflowStepInstance` содержит `projectId` active project
- **AND** входные и выходные данные шага описаны через artifacts
- **AND** состояние шага строится из текущего progress/check-result без миграции storage

#### Scenario: Workflow step хранит project-aware runtime bindings без жёсткого 1:1 с Workbench
- **WHEN** runtime строит workflow projection для открытой lab task
- **THEN** текущий `WorkflowStepInstance` может нести `runtimeBindings.workbenchInstanceIds`
- **AND** primary workbench, если он выбран, соответствует `WorkbenchInstance`, связанному с тем же `projectId`, `taskId` и workflow step
- **AND** workflow contract не требует, чтобы каждый шаг имел ровно один `WorkbenchInstance`

#### Scenario: Runtime surface может показать текущий workflow step через Workbench
- **WHEN** пользователь открывает текущую рабочую поверхность
- **THEN** surface может показать `workflow.currentStepId` и kind текущего шага
- **AND** surface связывает этот шаг с primary `WorkbenchInstance`
- **AND** пользовательская модель читает Workbench как materialization текущего workflow step

#### Scenario: Runtime строит coordinator step для работы над workflow целиком
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** текущим `WorkflowStepInstance` становится coordinator step `Работаем над workflow`
- **AND** этот step получает project-aware runtime bindings к primary `WorkbenchInstance`
- **AND** coordinator step может использовать legacy task/level progress как internal bridge без миграции storage

#### Scenario: Runtime публикует catalog of workflow points для image-to-component задачи
- **WHEN** runtime строит workflow projection задачи создания React-компонента по картинке
- **THEN** projection содержит workflow points для базового компонентного набора артефактов
- **AND** среди них есть пункты для базового компонента из UI kit, стилизации, mock-данных, props-контракта и Storybook-сценариев
- **AND** эти points доступны как часть единого workflow surface, а не как скрытая внутренняя структура уровней

#### Scenario: Legacy level progress мапится в статусы workflow points без миграции storage
- **WHEN** система ещё использует текущие task/level runtime данные
- **THEN** статусы workflow points могут вычисляться из legacy progress, lab context и связанных artifacts
- **AND** storage contract уровней не требует немедленной миграции ради нового workflow surface

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL давать read-only доступ к project-owned workflow surface и использовать его как основной способ объяснить пользователю текущую работу над проектом.

#### Scenario: Пользователь видит project-owned workflow прямо на странице проекта
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит workflow проекта как наблюдаемую сущность с этапами, текущим фокусом и последней активностью
- **AND** readout не требует знания task runtime, чтобы понять текущее состояние
- **AND** project page остаётся главной поверхностью наблюдения за workflow

#### Scenario: Пользователь переводит проектный workflow на конкретный компонент
- **WHEN** пользователь открывает `/projects/<projectId>`
- **AND** у проекта есть `ProjectComponent`
- **AND** пользователь выбирает действие `Сделать фокусом проекта`
- **THEN** workflow проекта начинает работать через выбранный компонент
- **AND** project page показывает этот компонент как текущий фокус
- **AND** пользователь не покидает project surface ради отдельной задачи

#### Scenario: Пользователь возвращает готовый компонент в активный workflow
- **WHEN** компонент уже был отмечен как готовый внутри проекта
- **AND** пользователь снова выбирает его как фокус проекта
- **THEN** workflow возвращает этот компонент в активную работу проекта
- **AND** такой возврат отражается прямо в project readout и истории работы

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

Система SHALL давать read-only доступ к project-aware workflow/artifact surface без изменения underlying orchestration и использовать этот readout для project-facing навигации по компонентам.

#### Scenario: Пользователь видит project-aware artifacts и bindings
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит project-aware artifacts и runtime bindings
- **AND** пользователь видит workflow-run как наблюдаемую сущность с пунктами и последней активностью
- **AND** readout не требует редактирования workflow для понимания текущего состояния

#### Scenario: Start и iterate generation управляются выбранным workflow-пунктом
- **WHEN** runtime строит production prompt для `start` или `iterate`
- **AND** active screen соответствует workflow-пункту
- **THEN** selected workflow-point ограничивает primary file set этой генерации
- **AND** supporting files остаются доступными как контекст

#### Scenario: Пользователь запускает workflow из компонента проекта
- **WHEN** пользователь открывает `/projects/<projectId>`
- **AND** у проекта есть `ProjectComponent`
- **AND** пользователь выбирает действие `Работать над компонентом`
- **THEN** система использует внутренний workflow-template runtime для этого workflow
- **AND** несколько компонентов одного проекта могут использовать один и тот же workflow template без конфликта runtime-данных
- **AND** конкретный template `taskId` не становится пользовательской привязкой самого `ProjectComponent`
- **AND** запускает существующий `image-to-component` workflow в контексте выбранного проекта
- **AND** переводит пользователя в рабочую workflow-сессию этого компонента

#### Scenario: Пользователь продолжает workflow компонента из страницы проекта
- **WHEN** у `ProjectComponent` уже есть открытый component-scoped runtime
- **AND** project page показывает краткий workflow readout для этого runtime
- **THEN** пользователь видит состояние run и последнюю активность прямо в карточке компонента
- **AND** действие `Продолжить работу` открывает ту же workflow-сессию, а не создаёт новую

#### Scenario: Пользователь видит компонент проекта внутри workflow-сессии
- **WHEN** пользователь открывает workflow-сессию компонента проекта
- **THEN** Workbench header явно показывает название `ProjectComponent`
- **AND** пользователь понимает, что текущий runtime обслуживает этот компонент, не раскрывая concrete template task как основную пользовательскую сущность

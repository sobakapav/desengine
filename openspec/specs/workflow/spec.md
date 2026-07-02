## Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через `WorkflowInstance` и `WorkflowStepInstance`.

#### Scenario: Workflow step принадлежит проекту
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** каждый `WorkflowStepInstance` принадлежит этому `projectId`
- **AND** входные и выходные данные шага описаны через artifacts
- **AND** пользователь читает шаг как часть проектной работы, а не как отдельный legacy-экран

#### Scenario: Runtime строит coordinator step для работы над workflow целиком
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** текущим `WorkflowStepInstance` становится coordinator step `Работаем над workflow`
- **AND** этот step получает project-aware runtime bindings
- **AND** coordinator step не требует отдельной legacy-сущности в пользовательской модели

#### Scenario: Runtime публикует catalog of workflow points для image-to-component workflow
- **WHEN** runtime строит workflow projection создания React-компонента по картинке
- **THEN** projection содержит workflow points для базового компонентного набора артефактов
- **AND** среди них есть пункты для базового компонента из UI kit, стилизации, mock-данных, props-контракта и Storybook-сценариев
- **AND** эти points доступны как часть единого workflow surface, а не как скрытая внутренняя структура уровней

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL давать read-only доступ к project-owned workflow surface и использовать его как основной способ объяснить пользователю текущую работу над проектом.

#### Scenario: Пользователь видит project-owned workflow прямо на странице проекта
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит workflow проекта как наблюдаемую сущность с этапами, текущим фокусом и последней активностью
- **AND** readout не требует знания legacy runtime, чтобы понять текущее состояние
- **AND** project page остаётся главной поверхностью наблюдения за workflow

#### Scenario: Пользователь переводит проектный workflow на конкретный компонент
- **WHEN** пользователь открывает `/projects/<projectId>`
- **AND** у проекта есть `ProjectComponent`
- **AND** пользователь выбирает действие `Сделать фокусом проекта`
- **THEN** workflow проекта начинает работать через выбранный компонент
- **AND** project page показывает этот компонент как текущий фокус
- **AND** пользователь не покидает project surface ради отдельного legacy-маршрута

#### Scenario: Пользователь возвращает готовый компонент в активный workflow
- **WHEN** компонент уже был отмечен как готовый внутри проекта
- **AND** пользователь снова выбирает его как фокус проекта
- **THEN** workflow возвращает этот компонент в активную работу проекта
- **AND** такой возврат отражается прямо в project readout и истории работы

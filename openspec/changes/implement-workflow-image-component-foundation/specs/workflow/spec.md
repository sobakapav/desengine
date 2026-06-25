## MODIFIED Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать работу над задачей создания React-компонента по картинке через канонический workflow, а не через прямое отождествление workflow step с текущим уровнем лаборатории.

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

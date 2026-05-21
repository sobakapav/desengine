# Roadmap: Workbench Entity Workflow Step

## Владелец

`focus-features` владеет roadmap workflow-step сущности и поддерживает его для `dispatcher-workbench-entity-workflow-step`.

## Что задаёт roadmap

- рамку для сущности workflow step в workbench;
- связь step-модели с task/workflow доменом;
- последовательность между исследованием, контрактом и реальной UI/runtime реализацией.

## Downstream-правила

- сначала исследование и контракт step-модели;
- затем dispatcher или implement changes по отдельным срезам поведения;
- любые изменения шага обязаны фиксировать capability/scenarios и тестовый уровень.

# Roadmap: Workflow

## Владелец

`focus-domain` владеет roadmap workflow-линии и предоставляет его `producer-workflow` и `dispatcher-workflow`.

## Что задаёт roadmap

- рамку workflow как first-class процесса продукта;
- связь workflow с `project`, `task`, `artifacts` и `workbench`;
- последовательность между foundation-моделью, user-facing manifestation и vertical workflow slices;
- controlled transition away from level-driven process model.

## Downstream-правила

- сначала закрепляется process-модель и язык workflow;
- затем downstream changes materialize workflow через Workbench и task/artifact boundaries;
- vertical workflow slices не должны переоткрывать базовую process-модель без явного producer/dispatcher решения;
- любые изменения workflow обязаны фиксировать capability/scenarios и тестовый уровень.

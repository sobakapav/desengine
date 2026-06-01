# Roadmap: Packaging Readiness Storage Adapters

## Владелец

`producer-task-and-workflow-entities` владеет этим roadmap и использует его как planning-вход для packaging ideas вместе с архитектурным roadmap из `focus-tech`.

## Зачем нужен второй roadmap

`focus-tech` задаёт общий порядок архитектурной трансформации, а этот roadmap фиксирует предметную логику Task/Workflow/Artifact storage перед packaging.

## Что направляет roadmap

- boundaries для project/task/workflow/artifact data;
- readiness требования к export/delete/backup/migration;
- отделение secrets и credentials от пользовательских артефактов;
- критерии, когда packaging может перейти из readiness в implementation.

## Правило полезности

Roadmap считается рабочим, если он помогает отличить архитектурный prerequisite от planning-контекста packaging-идей и не даёт packaging implementation стартовать «на доверии».

# Roadmap: Project Producer

`producer-project` ведёт первую delivery-рамку внедрения сущности `Project` внутри `focus-domain`.

## Что входит в producer-owned контур

- сущность `Project` как новый верхний feature context;
- обязательный базовый `UI kit` как project-level contract;
- делегирование первого downstream foundation-change для `ProjectWorkspace` и active project boundary;
- постепенный перенос уже существующих сущностей в project context;
- отделение внедрения `Project` от будущего `Project Roadmap`.

## Первая волна

- поставить отдельный `implement`-change для `project entity and storage boundary`;
- ввести `ProjectWorkspace` как контейнер независимой работы;
- требовать имя проекта и базовый `UI kit` при создании;
- определить active project boundary и `project.settings` как канонический source of truth для preview contract.

## Вторая волна

- component/workflow integration;
- workflow integration как отдельный процесс решения;
- `workbench` / preview binding к project contract;
- отдельное решение для progress invalidation при смене `UI kit`.

## Следующие волны

- user-facing manifestation проекта:
  - отдельный раздел `Проекты` в глобальной навигации;
  - отдельная страница списка проектов;
  - отдельная страница конкретного проекта;
  - явная project/component/workflow привязка в пользовательском контуре;
  - project-level config surface и `UI kit` contract в пользовательском мире;
- project-scoped история и диагностика;
- read-only workflow/artifact surface проекта;
- project-level `LLM` binding;
- project-level `Figma` binding;
- project-level `Git` / `GitHub` binding.

## Особое правило

Смена project `UI kit` считается тяжёлой migration-операцией:

- допускается;
- требует отдельного UX и downstream-проверок;
- может откатывать часть project progress и выполненной проектной работы.

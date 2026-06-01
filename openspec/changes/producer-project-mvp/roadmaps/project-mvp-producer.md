# Roadmap: Project MVP Producer

`producer-project-mvp` ведёт первую delivery-рамку project mode внутри `focus-domain`.

## Что входит в producer-owned контур

- сущность `Project` как новый верхний feature context;
- обязательный базовый `UI kit` как project-level contract;
- постепенный перенос уже существующих сущностей в project context;
- отделение MVP project mode от будущего `Project Roadmap`.

## Первая волна

- ввести `Project` как контейнер независимой работы;
- требовать имя проекта и базовый `UI kit` при создании;
- определить, как `task`, `workbench` и progress начинают зависеть от project contract.

## Следующие волны

- onboarding/task integration;
- project-level `LLM` binding;
- project-level `Figma` binding;
- project-level `Git` / `GitHub` binding.

## Особое правило

Смена project `UI kit` считается тяжёлой migration-операцией:

- допускается;
- требует отдельного UX и downstream-проверок;
- может откатывать часть project progress и выполненных задач.

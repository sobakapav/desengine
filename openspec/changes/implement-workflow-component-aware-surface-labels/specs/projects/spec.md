## MODIFIED Requirements

### Requirement: Проект является контейнером для пользовательских компонентов

Система SHALL сохранять component-aware контекст не только на странице проекта, но и в downstream workflow/workbench surfaces.

#### Scenario: Пользователь видит компонент проекта внутри workbench summary
- **WHEN** пользователь открывает workflow/workbench surface компонента проекта
- **THEN** summary показывает, что сессия связана не только с проектом, но и с конкретным `ProjectComponent`

#### Scenario: Пользователь видит компонент проекта в списке workflow-сессий
- **WHEN** в проекте уже есть несколько workflow/workbench сессий по компонентам
- **THEN** карточка сессии показывает название связанного `ProjectComponent`
- **AND** пользователь не путает разные workflow-сессии только по внутреннему id

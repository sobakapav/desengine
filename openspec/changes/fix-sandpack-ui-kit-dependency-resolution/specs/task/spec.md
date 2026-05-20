## MODIFIED Requirements

### Requirement: Sandpack preview использует настройки проекта

Система SHALL собирать Sandpack preview с учётом `project.uiKitId` и `project.uiMode`, чтобы preview можно было переключать на уровне проекта без смены глобального стека.

#### Scenario: Sandpack payload включает runtime-зависимости выбранного UI kit
- **WHEN** клиент запрашивает Sandpack payload с `project.uiKitId` и `project.uiMode=ui-kit`
- **THEN** payload включает пакет выбранного UI kit и его runtime-зависимости, нужные для резолва внутренних импортов
- **AND** preview не должен падать из-за отсутствующих внутренних модулей UI kit-контракта

## MODIFIED Requirements

### Requirement: Sandpack preview использует настройки проекта

Система SHALL собирать Sandpack preview с учётом `project.uiKitId` и `project.uiMode`, чтобы preview можно было переключать на уровне проекта без смены глобального стека.

#### Scenario: Sandpack preview использует project.uiKitId
- **WHEN** клиент запрашивает Sandpack payload с `project.uiKitId`
- **THEN** preview builder подключает UI kit из project settings
- **AND** список kit'ов берётся из единого Sandpack UI kit config

#### Scenario: Режим html-tags работает без UI kit
- **WHEN** `project.uiMode=html-tags` и `project.uiKitId=none`
- **THEN** Sandpack payload содержит только базовые React-зависимости
- **AND** HTML JSX-теги рендерятся без дополнительных UI kit-пакетов

#### Scenario: Preview показывает безопасный fallback при несовместимости проекта
- **WHEN** компонент использует UI kit-импорты или абстрактные JSX-компоненты в режиме `html-tags`
- **THEN** preview builder возвращает безопасный fallback-компонент и статус несовместимости
- **AND** лаборатория продолжает работать

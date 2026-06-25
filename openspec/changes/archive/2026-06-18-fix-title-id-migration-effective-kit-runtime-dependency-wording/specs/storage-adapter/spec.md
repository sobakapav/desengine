## MODIFIED Requirements

### Requirement: Storage backend ещё локальный

Система SHALL до следующей storage-волны хранить project registry и active project в локальном browser storage.

#### Scenario: Пользователь работает с проектами в текущей волне
- **WHEN** пользователь создаёт, выбирает или редактирует проект
- **THEN** project registry сохраняется в локальном browser storage
- **AND** пользовательский слой может явно сообщать, что файловый path проекта пока не используется

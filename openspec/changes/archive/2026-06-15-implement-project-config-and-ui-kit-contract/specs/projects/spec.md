## ADDED Requirements

### Requirement: Проект имеет простой пользовательский config surface

Система SHALL давать пользователю простой способ прочитать и изменить конфигурацию проекта, минимум через JSON и canonical project settings.

#### Scenario: Пользователь открывает config проекта
- **WHEN** пользователь открывает страницу проекта
- **THEN** система показывает project config как пользовательский surface
- **AND** config читается из canonical `ProjectWorkspace`

#### Scenario: Пользователь меняет UI kit проекта из canonical списка
- **WHEN** пользователь выбирает другой `uiKitId` для проекта
- **THEN** система использует canonical список доступных UI kit'ов
- **AND** изменение сохраняется в `ProjectWorkspace.settings`
- **AND** effective runtime-kit остаётся явным для пользователя

#### Scenario: Страница проекта показывает selected и effective UI kit
- **WHEN** пользователь просматривает конфигурацию проекта
- **THEN** система явно показывает selected `uiKitId`
- **AND** отдельно показывает effective UI kit для prompt/preview contract
- **AND** не скрывает влияние `uiMode` на effective runtime-kit

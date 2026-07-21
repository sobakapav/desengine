## MODIFIED Requirements

### Requirement: Project Workspace является canonical project scope

Система SHALL иметь единую сущность `ProjectWorkspace` для настроек, metadata и данных проекта.

#### Scenario: Пользователь создаёт первый проект в MVP workspace
- **WHEN** в registry ещё нет ни одного проекта
- **AND** пользователь создаёт первый `ProjectWorkspace` с именем, кодом, выбранным `uiKitId` и абсолютным server path
- **THEN** система сохраняет canonical `ProjectWorkspace`
- **AND** внутри project metadata сразу фиксируются `title`, `code` и `uiKitId`
- **AND** этот проект становится active project через project boundary

### Requirement: Проект имеет простой пользовательский config surface

Система SHALL давать пользователю простой способ прочитать и изменить конфигурацию и sources проекта на странице `/projects/<projectId>`.

#### Scenario: Пользователь редактирует title, code и UI kit проекта
- **WHEN** пользователь меняет название, код или `uiKitId` проекта
- **THEN** система сохраняет обновлённый `ProjectWorkspace`
- **AND** `code` остаётся отдельным project field
- **AND** пользователь видит только один выбранный UI kit без отдельного effective-режима

#### Scenario: Пользователь видит project-owned sources и archive
- **WHEN** пользователь открывает supporting/config layer проекта
- **THEN** система показывает Figma files, structure graphs и document archive как части проекта
- **AND** эти данные читаются как проектные metadata/sources, а не как побочные runtime outputs

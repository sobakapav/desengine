## ADDED Requirements

### Requirement: API публикует project-owned сущности как внешний контракт

Система SHALL публиковать API только вокруг сущностей, которыми пользователь реально владеет внутри проекта.

#### Scenario: Пользователь или внешняя автоматизация читает manifest через API
- **WHEN** внешний клиент вызывает project API для manifest
- **THEN** API возвращает project manifest как основной переносимый контракт
- **AND** ответ не зависит от знания внутренних browser-local ключей хранения

#### Scenario: API не публикует внутренние служебные слои как отдельную ценность
- **WHEN** проектный API формирует набор доступных ресурсов
- **THEN** он публикует только project-owned сущности вроде manifest, artifacts, workflow templates и prompt brief
- **AND** не навязывает клиенту внутренние transport/runtime детали как продуктовый контракт

## Requirements

### Requirement: Проект имеет переносимый manifest

Система SHALL иметь внешний `project manifest`, который выражает проект как переносимый пакет пользовательской работы, а не только как внутреннее runtime state приложения.

#### Scenario: Пользователь экспортирует проект в manifest
- **WHEN** пользователь открывает страницу проекта
- **THEN** система позволяет экспортировать project manifest для этого `ProjectWorkspace`
- **AND** manifest содержит `project`, `components`, `workflow template`, `artifacts summary` и `prompt brief`

#### Scenario: Пользователь импортирует manifest в локальный проект
- **WHEN** пользователь выбирает manifest-файл проекта для импорта
- **THEN** система создаёт или обновляет `ProjectWorkspace` из этого manifest
- **AND** импорт не требует ручного восстановления скрытых внутренних состояний

### Requirement: Manifest имеет стабильную версию и продуктовое имя

Система SHALL явно версионировать manifest и показывать его как пользовательский контракт проекта.

#### Scenario: Пользователь смотрит на экспортируемый manifest
- **WHEN** система готовит manifest к скачиванию или API-ответу
- **THEN** manifest содержит явное поле версии
- **AND** структура manifest читается как product-facing project contract, а не как внутренний debug dump

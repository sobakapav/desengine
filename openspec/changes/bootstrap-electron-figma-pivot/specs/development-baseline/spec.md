## ADDED Requirements

### Requirement: Локальная проверка должна работать в SSH-среде

Разработчик SHALL иметь возможность проверить базовую работоспособность проекта без desktop GUI и без локального Electron packaging.

#### Scenario: Базовая проверка кода

- **WHEN** разработчик запускает `npm run typecheck`
- **THEN** все workspace-пакеты с typecheck-скриптом проверяются TypeScript

#### Scenario: Базовая сборка кода

- **WHEN** разработчик запускает `npm run build`
- **THEN** собираются кодовые пакеты
- **AND** desktop packaging не запускается как часть корневого `build`

### Requirement: Desktop packaging должен быть отдельным действием

Система SHALL отделять desktop packaging от обычной локальной сборки.

#### Scenario: Явная desktop package-сборка

- **WHEN** разработчик запускает `npm run package:desktop`
- **THEN** вызывается package-скрипт workspace `@desengine/desktop`

#### Scenario: CI package-сборка

- **WHEN** запускается workflow `Desktop Package`
- **THEN** GitHub Actions собирает desktop package на поддерживаемых платформах
- **AND** результат сохраняется как artifact

### Requirement: Shared protocol должен быть отдельным workspace-пакетом

Система SHALL хранить общие контракты обмена между Figma plugin и desktop app в отдельном workspace-пакете.

#### Scenario: Protocol package build

- **WHEN** разработчик запускает `npm run build --workspace @desengine/protocol`
- **THEN** TypeScript собирает пакет в `dist`

#### Scenario: Protocol package typecheck

- **WHEN** разработчик запускает `npm run typecheck --workspace @desengine/protocol`
- **THEN** TypeScript проверяет исходный код пакета без генерации файлов

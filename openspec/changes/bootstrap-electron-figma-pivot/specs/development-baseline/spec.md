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

### Requirement: Desktop renderer должен иметь минимальный React baseline

Desktop renderer SHALL запускаться как React-приложение внутри Electron Forge + Webpack рамки и SHALL показывать версию shared protocol.

#### Scenario: Renderer показывает версию protocol

- **WHEN** desktop renderer загружает главный экран
- **THEN** пользователь видит экран `desengine`
- **AND** экран использует `DESENGINE_PROTOCOL_VERSION` из `@desengine/protocol`
- **AND** renderer не получает прямой Node API

### Requirement: UI baseline должен использовать Tailwind и локальные shadcn-compatible компоненты

Desktop UI SHALL использовать Tailwind CSS как styling layer и shadcn/ui-compatible локальные компоненты без смены Electron Forge/Webpack стека.

#### Scenario: Tailwind обрабатывается существующим Webpack renderer

- **WHEN** desktop renderer собирает CSS
- **THEN** Webpack применяет PostCSS/Tailwind pipeline к `apps/desktop/src/index.css`
- **AND** локальные UI-компоненты используют общий `cn` helper

### Requirement: Ближайшая smoke-проверка должна быть отделена от финальной проверки

Система SHALL иметь Playwright smoke skeleton для renderer contract и packaged desktop launch, но финальную проверку изменений SHALL выполнять отдельный агент или пользователь.

#### Scenario: Renderer contract smoke

- **WHEN** внешний проверяющий запускает `npm run test:smoke`
- **THEN** Playwright проверяет, что renderer baseline связан с React, Tailwind и shared protocol

#### Scenario: Packaged desktop launch smoke

- **WHEN** внешний проверяющий запускает `DESENGINE_DESKTOP_EXECUTABLE=<path> npm run test:desktop --workspace @desengine/desktop`
- **THEN** Playwright запускает packaged desktop app
- **AND** проверяет наличие главного окна desengine

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

### Requirement: Dev handoff между Figma plugin и desktop должен быть живым минимальным контуром

Система SHALL иметь минимальный development-only handoff, который показывает, что Figma plugin может отправить selection ping и PNG visual snapshot в desktop app через loopback endpoint.

#### Scenario: Desktop принимает Figma selection ping

- **WHEN** Electron desktop app запущено локально
- **AND** Figma plugin отправляет `POST /figma/selection` на `127.0.0.1:37645`
- **THEN** main process валидирует payload через `@desengine/protocol`
- **AND** renderer показывает количество выбранных объектов и их имена

#### Scenario: Desktop показывает PNG выбранного Figma node

- **WHEN** пользователь выбирает один Figma node
- **AND** Figma plugin экспортирует его через `exportAsync` в PNG
- **AND** plugin отправляет `POST /figma/visual-snapshot` на `127.0.0.1:37645`
- **THEN** main process валидирует payload через `@desengine/protocol`
- **AND** renderer показывает PNG как основной визуальный preview

#### Scenario: Handoff endpoint остаётся development-only

- **WHEN** dev endpoint принимает request
- **THEN** endpoint слушает только `127.0.0.1`
- **AND** payload ограничен по размеру
- **AND** payload проверяется Zod-схемой
- **AND** фиксированный dev token не считается production pairing

#### Scenario: PNG visual snapshot имеет повторно используемый handoff-контракт

- **WHEN** Figma plugin или desktop app работает с PNG visual snapshot
- **THEN** route-константы, URL helper, format, export scale, Zod-схема и TypeScript-тип берутся из `@desengine/protocol`
- **AND** Figma plugin экспортирует PNG через отдельный helper, принимающий `SceneNode`

#### Scenario: Desktop показывает взрыв-схему auto-layout Frame

- **WHEN** пользователь выбирает Frame с auto-layout
- **AND** Figma plugin отправляет `POST /figma/exploded-frame` на `127.0.0.1:37645`
- **THEN** payload содержит PNG самого frame и до 100 PNG leaf-элементов
- **AND** plugin рекурсивно раскрывает auto-layout Frame до глубины 4
- **AND** plugin останавливается на instance, не-auto-layout frame, не-frame node или max depth
- **AND** payload содержит относительные координаты leaf-элементов внутри root frame
- **AND** payload содержит depth, parent node id, path и stop reason leaf-элемента
- **AND** main process валидирует payload через `@desengine/protocol`
- **AND** renderer показывает frame reference и вынесенные children как визуальную взрыв-схему
- **AND** leaf-элементы со stop reason `instance` выделяются фиолетовой рамкой
- **AND** рабочая область результата занимает всё доступное окно и прокручивается по горизонтали и вертикали

#### Scenario: Кнопка взрыв-схемы недоступна для неподходящего выбора

- **WHEN** первый выбранный объект не является auto-layout Frame
- **THEN** Figma plugin показывает кнопку `Создать взрыв-схему` как недоступную

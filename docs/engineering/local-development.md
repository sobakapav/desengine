# Локальная разработка

## Базовый режим

Проект разрабатывается на удалённой машине через SSH. Поэтому локальные команды должны быть пригодны для headless-среды.

Базовые проверки:

```bash
npm run typecheck
npm run build
npm run test:smoke
```

`npm run build` в корне не должен собирать Electron package. Он собирает кодовые пакеты, которые должны работать без GUI и без desktop packaging.

## Desktop app

Desktop-приложение находится в `apps/desktop`.

Команды:

```bash
npm start --workspace @desengine/desktop
npm run package:desktop
npm run make:desktop
```

`npm start --workspace @desengine/desktop` может успешно стартовать процесс, но окно может не открыться на машине пользователя, если разработка идёт через SSH без графического окружения.

`npm run package:desktop` на SSH-машине не считается обязательной локальной проверкой. В этой среде Electron Forge может пытаться догружать Electron runtime/template и упираться в сетевой кэш. Authoritative package-сборка выполняется в GitHub Actions.

## Shared protocol

Общий пакет протокола находится в `packages/protocol`.

Команды:

```bash
npm run typecheck --workspace @desengine/protocol
npm run build --workspace @desengine/protocol
```

Этот пакет должен оставаться общим источником контрактов для Figma plugin и desktop app. Форматы сообщений нельзя дублировать вручную в разных приложениях.

## UI baseline

Desktop renderer использует React, Tailwind CSS и локальные shadcn/ui-compatible компоненты внутри `apps/desktop`.

Команды:

```bash
npm run test:smoke
npm run test:smoke --workspace @desengine/desktop
```

`test:smoke` сейчас проверяет renderer contract: связь React entrypoint, Tailwind CSS и `@desengine/protocol`. Это не заменяет desktop launch smoke.

## Desktop smoke

Packaged desktop smoke запускается отдельно, когда есть готовый executable:

```bash
DESENGINE_DESKTOP_EXECUTABLE=<path> npm run test:desktop --workspace @desengine/desktop
```

Этот smoke использует Playwright Electron automation и не считается базовой SSH-friendly проверкой.

## Figma dev handoff

Минимальная локальная проверка связи Figma и desktop:

```bash
npm run build
npm start --workspace @desengine/desktop
```

В Figma Desktop App:

1. открыть `Plugins -> Development -> Import plugin from manifest...`;
2. выбрать `apps/figma-plugin/manifest.json`;
3. выбрать один или несколько объектов на странице;
4. запустить plugin `desengine`;
5. нажать `Отправить выбор`.

Если desktop app запущено, renderer покажет PNG выбранного объекта как основной preview. Figma manifest использует `http://localhost:37645`, а Electron endpoint слушает loopback. Этот handoff использует фиксированный dev token и не является production pairing.

## Workspace

Корневой `package.json` использует npm workspaces:

```json
[
  "apps/*",
  "packages/*"
]
```

Зависимости между workspace-пакетами нужно добавлять по package name, например:

```bash
npm install @desengine/protocol@0.0.1 --workspace @desengine/desktop
```

## Что считать готовой локальной точкой

Минимальная локальная точка готовности:

- `npm run typecheck` проходит;
- `npm run build` проходит;
- `npm run test:smoke` проходит, если изменение затрагивает renderer baseline;
- изменения отражены в документации или OpenSpec, если поменялось поведение системы;
- `git status --short` показывает ожидаемые изменения.

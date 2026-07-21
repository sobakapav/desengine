# CI/CD

## Текущий уровень

На 2026-07-21 настроен базовый CI и ручная desktop package-сборка.

Это ещё не release pipeline. Signing, notarization, auto-update, публикация релизов и Figma plugin release будут отдельным этапом.

## Workflows

### Checks

Файл: `.github/workflows/checks.yml`.

Запускается автоматически:

- на `push`;
- на `pull_request`;
- вручную через `workflow_dispatch`.

Проверяет:

```bash
npm ci
npm run typecheck
npm run build
npm audit --omit=dev
```

`Checks` уже запускался для побочной ветки и прошёл.

### Desktop Package

Файл: `.github/workflows/desktop-package.yml`.

Запускается вручную через GitHub Actions.

Собирает desktop package на:

- Ubuntu;
- Windows;
- macOS.

Результат сохраняется как GitHub Actions artifacts.

Этот workflow уже был запущен вручную и отработал.

## Почему package не входит в обычный build

Корневой `npm run build` должен быть быстрым и headless-friendly. Он не должен зависеть от Electron packaging, GUI, локального кэша Electron runtime или сетевых условий SSH-машины.

Desktop package вызывается явно:

```bash
npm run package:desktop
```

или через GitHub Actions.

## Что будет позже

Следующий release-этап должен отдельно покрыть:

- installer-level smoke;
- desktop app launch smoke;
- Figma plugin bundle;
- Figma plugin smoke;
- protocol compatibility check;
- local endpoint compatibility check;
- code signing;
- macOS notarization;
- auto-update channel;
- release artifacts.

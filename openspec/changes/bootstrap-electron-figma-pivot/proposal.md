# Bootstrap Electron/Figma pivot

## Why

После pivot старая техническая основа больше не соответствует продуктовой гипотезе. Проекту нужна новая минимальная база, которую можно развивать как desktop-приложение с отдельным Figma plugin.

Цель change - зафиксировать стартовую платформу и правила проверки, не притворяясь, что продуктовый workflow уже спроектирован.

## What Changes

- Вводится Electron desktop app как основной пользовательский shell.
- Вводится общий пакет `@desengine/protocol`.
- Фиксируется направление Figma plugin -> local endpoint -> desktop player.
- Корневой `build` отделяется от desktop packaging.
- CI проверяет typecheck, build и runtime audit.
- Desktop package собирается отдельным ручным workflow.

## Capabilities

- `development-baseline`
- `desktop-packaging-baseline`
- `figma-desktop-handoff-baseline`

## Impact

Новый baseline позволяет завтра продолжить с React renderer и первым пользовательским workflow, не восстанавливая решения из переписки.

Release pipeline, signing, notarization, auto-update и публикация Figma plugin остаются вне scope этого change.

## Why

Нужно подключить React Aria (Adobe) как Sandpack UI kit, чтобы он выбирался на уровне проекта через общий механизм переключения UI kit'ов.

## Зависимости

Этот change зависит от `project-ui-kit-switching-2026-05-19` и не должен реализовываться до его полного завершения.

## What Changes

- Добавляем `uiKitId` для React Aria в конфиг Sandpack UI kit'ов.
- Фиксируем зависимости (возможно, потребуется `react-aria`, `react-stately`, `@react-aria/...` и т.п. — в рамках good enough).
- Добавляем smoke-пример, который проверяет базовый рендер и события.


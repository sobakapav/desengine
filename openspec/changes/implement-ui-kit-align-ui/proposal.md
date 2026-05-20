## Why

Нужно подключить Align UI как Sandpack UI kit, чтобы он был доступен для выбора в проекте через общий механизм переключения.

## Зависимости

Этот change зависит от `dispatcher-project-ui-kit-switching` и не должен реализовываться до его полного завершения.

## What Changes

- Добавляем Align UI в конфиг Sandpack UI kit'ов.
- Фиксируем зависимости (good enough) и любой необходимый bootstrap.
- Добавляем smoke-пример рендера.


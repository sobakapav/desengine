## Why

`os:close` для browser-oriented fixes периодически срывается не из-за самого change, а из-за lifecycle-дефекта в `tools/testing/run-browser-verification-runtime.mjs`. Wrapper поднимает managed `next dev`, но после неуспешного или даже успешного прогона может оставить живой процесс, и следующий запуск получает ложный конфликт `Another next dev server is already running`.

Это создаёт повторяемый внешний blocker:

- один browser-fix может быть уже подтверждён отдельным wrapper-run;
- штатный `os:close` потом повторно падает на конфликтующем `next dev`;
- в результате test-system выглядит нестабильным там, где проблема на самом деле в cleanup path.

## What Changes

- Перевести managed browser wrapper с shell shim `node_modules/.bin/next` на прямой запуск `next` через `process.execPath`.
- Добавить явное ожидание завершения managed `next dev` и принудительный cleanup, если процесс не закрылся сам.
- Закрепить source-contract guard, чтобы wrapper не возвращался к lifecycle-модели, которая переживает собственный прогон.

## Impact

- Повторные browser verification и `os:close` перестанут ломаться на остаточном managed `next dev`.
- Ложный инфраструктурный конфликт больше не будет маскироваться под дефект продуктового browser-fix.
- Test-system получит более надёжный close-path для browser-oriented changes.

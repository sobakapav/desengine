## Why

`lib/task/actions.ts` и `lib/task/server.ts` являются центральным runtime-контуром. Для релиза с чистым кодом их size waivers нужно снять через безопасную декомпозицию service/helper слоёв.

## What Changes

- Разделить крупные task action/server функции на понятные helpers.
- Сохранить HTTP/runtime contract task flows.
- Удалить снятые waivers.

## Impact

- Capability: `code-quality-text`, `task`, `iteration`.
- Уровень проверки: static/contract + unit + full.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:full`.

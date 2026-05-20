## Why

`components/ui/**` содержит shadcn-style UI kit файлы с size/function waivers. Для ближайшего релиза нужно либо снять их безопасной декомпозицией, либо явно признать конкретные vendor-style исключения долгоживущими после просмотра.

## What Changes

- Декомпозировать `calendar`, `carousel`, `chart`, `sidebar` без изменения public exports и визуального поведения.
- Удалить снятые waivers.
- Если исключение остаётся, записать конкретное обоснование.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: static/contract + unit/build.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run build`.

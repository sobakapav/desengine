## Why

`lib/llm/server.ts` содержит крупный provider runtime. Для релиза с чистым кодом нужно снять size waivers без изменения provider contracts и без live credentials.

## What Changes

- Вынести provider config/status/error helpers в маленькие модули рядом с `lib/llm`.
- Сохранить публичные exports и поведение.
- Удалить снятые waivers.

## Impact

- Capability: `code-quality-text`, `llm`, provider capabilities.
- Уровень проверки: static/contract + unit.
- Команды: `npm run quality:text:repo`, `npm run test:unit`.

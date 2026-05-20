## Why

После первичной нормализации остались runtime helpers с `function-length` waiver: onboarding sync status и system resource state сборка. Для релиза с чистым кодом эти исключения нужно снять безопасной декомпозицией.

## What Changes

- Вынести сборку onboarding status variants в отдельный модуль.
- Вынести добавление system resource sections в отдельный модуль.
- Удалить снятые waivers.

## Impact

- Capability: `code-quality-text`, `onboarding`, `system`.
- Уровень проверки: static/contract + unit/full.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:full`.

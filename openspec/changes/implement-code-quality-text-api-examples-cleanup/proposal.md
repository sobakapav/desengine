## Why

Repo-level gate выявил много `api-example` нарушений. Нетривиальные экспортируемые API должны иметь короткий `@example`, чтобы разработчикам и LLM-агентам было проще безопасно использовать контракты.

## What Changes

- Добавить JSDoc `@example` к активным `api-example` нарушениям.
- Сохранять существующее runtime-поведение.
- Не превращать примеры в длинную документацию; пример должен показывать основной вызов или usage-контракт.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: static/contract + unit для страховки компиляции.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`.
- Credentials: не требуются.

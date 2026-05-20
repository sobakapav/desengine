## Why

Ближайший релиз должен выходить с чистым кодом после проверки новой подсистемой `code-quality-text`. UI size waivers нельзя оставлять как релизный результат диспетчера: компоненты нужно нормализовать или отдельно обосновать долгоживущие исключения.

## What Changes

- Декомпозировать UI-компоненты с активными `function-length`/`file-length` waivers.
- Сохранять текущий UX и визуальный contract.
- Удалить снятые waivers из `tools/quality-text/waivers.json`.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: static/contract + unit/build.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run build`.

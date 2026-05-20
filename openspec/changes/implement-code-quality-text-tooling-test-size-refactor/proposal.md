## Why

Tooling и test waivers должны быть сняты или явно признаны долгоживущими только после просмотра. Релизная формулировка требует чистый код, значит инструменты проверки тоже не должны оставаться неразобранным долгом.

## What Changes

- Разделить крупные CLI/test файлы или обосновать долгоживущий waiver для generated/vendor-like структуры.
- Удалить снятые waivers.

## Impact

- Capability: `code-quality-text`, `testing-layer`.
- Уровень проверки: static/contract + unit.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`.

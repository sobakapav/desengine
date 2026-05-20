## Why

Оставшиеся `file-length` и `function-length` нарушения мешают сделать `quality:text:repo` зелёным. Эти нарушения требуют осторожного подхода: часть можно закрыть декомпозицией, часть legacy-монолитов безопаснее временно зафиксировать waiver с owner/reason/targetStage.

## What Changes

- Разрезать небольшие и безопасные функции/файлы.
- Для крупных legacy-монолитов добавить явные waivers только там, где немедленный рефакторинг рискованнее временного исключения.
- Довести `npm run quality:text:repo` до зелёного результата.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: static/contract + unit.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`, `npm run test:full`.
- Credentials: не требуются.

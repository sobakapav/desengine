## Why

После выделения подсистемы команде нужен понятный release-note: какие команды теперь канонические, сколько живут legacy alias и как закрывать waiver backlog.

## What Changes

- Добавить release-note для перехода на `quality:text*`.
- Зафиксировать timeline удаления legacy `test:readability*` alias.
- Провести финальные проверки, включая `npm run quality:text:repo`.
- Обновить dispatcher tasks по фактическому закрытию.

## Impact

- Capability: `code-quality-text`, `testing-layer`.
- Уровень проверки: static/contract + repo smoke.
- Команды проверки: `npm run test:unit`, `npm run test:traceability`, `npm run test:full`, `npm run quality:text:repo`.
- Mock/credentials: не требуются.

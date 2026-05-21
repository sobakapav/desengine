## Контекст

- Родительский dispatcher управляет архитектурными prerequisites.
- После внедрения PromptContext start-flow стал корректнее по архитектуре, но файл `lib/task/actions/start.ts` остался слишком крупным.
- `quality:text` допускает временный waiver, но этот cleanup должен закрыть waiver `architecture-followup-task-action-split`.

## Решение

- Оставить `lib/task/actions/start.ts` тонким orchestration-модулем:
  - `taskStartAction.startTaskLevel`;
  - запуск mutation boundary;
  - линейная сборка stages.
- Вынести runtime/load helpers в отдельный модуль рядом с action.
- Вынести LLM input/call/parse helpers в отдельный модуль рядом с action.
- Вынести запись файлов и completion response в отдельный модуль рядом с action.
- Не менять route handlers, payload format, LLM prompt templates, ProjectWorkspace, PromptContext и storage contracts.

## Проверка

- `npm run test:unit`
- `npm run test:traceability`
- `npm run quality:text`
- `git diff --check`

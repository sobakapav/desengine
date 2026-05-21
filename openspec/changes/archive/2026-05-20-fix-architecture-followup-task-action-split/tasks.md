## Tasks

- [x] 1. Уточнить постановку и границы реализации.
- [x] 2. Добавить OpenSpec delta для `code-readability`, `task`, `llm` или `prompt-context` при необходимости.
- [x] 3. Разбить `lib/task/actions/start.ts` на orchestration и helper-модули без изменения public contract.
- [x] 4. Обновить/добавить source-contract tests для start-flow, PromptContext builder и readability waiver removal.
- [x] 5. Убрать `lib/task/actions/start.ts` из `tools/quality-text/waivers.json`.
- [x] 6. Прогнать `npm run test:unit`, `npm run test:traceability`, `npm run quality:text`, `git diff --check`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `code-readability`: изменяемый production-файл не должен оставаться выше soft-limit без waiver.
  - `task`: start route/service boundary сохраняет HTTP contract и PromptContext builder.
  - `llm`: start-flow продолжает строить PromptContext перед prompt instruction.
  - `prompt-context`: start-flow использует общий PromptContext builder.
  - `testing-layer`: change проверяется unit/traceability/readability.
- Уровень проверки:
  - static/contract: обязательный.
  - unit/source-contract: обязательный.
  - integration/e2e/live: не требуется, HTTP/UX contract не меняется.
- Команды:
  - `npm run test:unit`
  - `npm run test:traceability`
  - `npm run quality:text`
  - `git diff --check`
- Mock/fixture-данные:
  - Используются существующие unit/source fixtures; live credentials не нужны.

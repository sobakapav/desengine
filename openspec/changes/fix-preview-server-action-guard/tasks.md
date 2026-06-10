## Tasks

- [ ] 1. Зафиксировать OpenSpec-контракт preview guardrail для неподдерживаемых Server Actions.
- [ ] 2. Добавить detect/fallback path в `buildSandpackPreviewPayload(...)`.
- [ ] 3. Уточнить host-level текст preview-диагностики для общего preview incompatibility surface.
- [ ] 4. Добавить unit-покрытие для ветки `unsupported_preview_api`.
- [ ] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task` / `Preview показывает безопасный fallback для Server Actions`
- `level-labs` / `Preview runtime guardrail помечает неподдерживаемый Server Action API`
- `testing-layer` / `Unit-проверка читает runtime diagnostics preview payload`

Уровни проверки:
- static/contract: обязателен
- unit: обязателен
- component/browser: не требуется для первого fix, потому что поведение фиксируется на payload-builder surface
- integration: не требуется
- e2e smoke: не требуется
- live/provider: не требуется

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- test/unit/sandpack-preview.test.ts`

Mock/fixture-данные и credentials:
- используются локальные fixture-исходники preview payload из unit-теста;
- live credentials не нужны.

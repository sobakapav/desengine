## Tasks

- [x] 1. Создать active release `release-2026-06-09-ui`.
- [x] 2. Перевести в него `implement-ux-highlight-correct-solution-diff`, `implement-task-titles`, `implement-integrate-monaco-editor-into-sandpack` и `implement-system-markdown-announcement` через `release_ref`.
- [x] 3. Обновить proposal/README/release-notes текущего UI- и quality-релиза под новый состав.
- [x] 4. Выполнить внешнюю static/contract-проверку release-lineage.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `admin-tools`: release change используется как релизная метка поставки, а downstream changes ссылаются на него через `release_ref`.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не нужны.

Примечание по верификации:
- Финальную проверку и формулировку результата выполняет внешний проверяющий агент или пользователь.

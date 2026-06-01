## Tasks

- [x] 1. Зафиксировать роль `release-2026-05-24-night` как релизной метки без изменения `parent_change` у downstream changes.
- [x] 2. Описать состав ночной волны fixes и связанных follow-up changes по triage пользовательских жалоб.
- [x] 3. Добавить delta spec на уровне `admin-tools`, который использует существующий контракт `release_ref` как traceability этого релиза.
- [x] 4. Подготовить тестовый след для внешней static/contract-проверки перед архивированием.

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

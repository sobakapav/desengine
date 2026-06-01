## Tasks

- [x] 1. Создать новый active release для grooming-волны integration changes.
- [x] 2. Перевести active downstream changes на `release_ref=release-2026-06-01-grooming`.
- [x] 3. Подготовить архивирование `release-2026-05-25-night` без нарушения traceability.
- [ ] 4. Выполнить внешнюю static/contract-проверку нового release-lineage.

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

## Tasks

- [ ] 1. Зафиксировать packaging readiness checklist.
- [ ] 2. Описать storage adapter categories local/desktop/hosted.
- [ ] 3. Зафиксировать export/delete/backup/migration requirements.
- [ ] 4. Отделить secrets/credentials policy от project/task/event storage.
- [ ] 5. Обновить OpenSpec specs `storage-adapter`, `packaging`.
- [ ] 6. Добавить static/contract tests для readiness rules.
- [ ] 7. Прогнать `npm run test:unit`, `npm run test:traceability`.

## Тестовая часть change

Затронутые capability/scenarios:
- `storage-adapter`: readiness для local/desktop/hosted profiles.
- `packaging`: packaging implementation проверяет prerequisites перед стартом.

Уровни проверки:
- static/contract: обязательный.
- unit: для export/delete fixtures, если добавляется код.
- e2e/live: не требуется.

Команды:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:
- Fixture project/task/event storage tree; live credentials не нужны.

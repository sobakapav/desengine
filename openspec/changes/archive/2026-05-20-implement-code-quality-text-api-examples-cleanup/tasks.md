## Tasks

- [x] 1. Снять список активных `api-example` нарушений из `quality:text:repo`.
- [x] 2. Добавить минимальные `@example` к API routes и page/components exports.
- [x] 3. Добавить минимальные `@example` к `lib/**` helpers.
- [x] 4. Проверить `npm run quality:text:repo` и убедиться, что `api-example` больше не активен.
- [x] 5. Проверить `npm run test:unit`.
- [x] 6. Проверить `npm run test:traceability`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Администратор запускает полный quality-аудит`, `Новое нарушение не покрыто waiver`.
- [x] Уровень проверки: static/contract + unit.
- [x] Команды запуска: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`.
- [x] Mock/fixture-данные: локальные исходники и waivers; live credentials не нужны.

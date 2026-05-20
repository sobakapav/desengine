## Tasks

- [x] 1. Снять список UI size waivers.
- [x] 2. Декомпозировать безопасные UI-компоненты без изменения UX.
- [x] 3. Отдельно оценить `components/ui/**` на долгоживущий vendor-style waiver.
- [x] 4. Удалить снятые waivers.
- [x] 5. Проверить `npm run quality:text:repo`, `npm run test:unit`, `npm run build`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Администратор запускает полный quality-аудит`, `Для legacy-файла вводится временное исключение`.
- [x] Уровень проверки: static/contract + unit/build.
- [x] Команды запуска: `npm run quality:text:repo`, `npm run test:unit`, `npm run build`.
- [x] Mock/fixture-данные: не требуются.

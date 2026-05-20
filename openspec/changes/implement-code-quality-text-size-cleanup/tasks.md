## Tasks

- [x] 1. Снять список активных `file-length` и `function-length` нарушений.
- [x] 2. Закрыть безопасные small/medium нарушения рефакторингом без изменения поведения.
  - Исправлены активные `floating-promise` нарушения через явный `void` для fire-and-forget async-вызовов.
- [x] 3. Снять временные waivers после декомпозиции risky legacy-монолитов.
- [x] 4. Проверить `npm run quality:text:repo` и убедиться, что size-нарушения больше не активны.
- [x] 5. Проверить `npm run test:unit`.
- [x] 6. Проверить `npm run test:traceability`.
- [x] 7. Проверить `npm run test:full`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Администратор запускает полный quality-аудит`, `Для legacy-файла вводится временное исключение`, `Новое нарушение не покрыто waiver`.
- [x] Уровень проверки: static/contract + unit.
- [x] Команды запуска: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`, `npm run test:full`.
- [x] Mock/fixture-данные: локальные исходники и waivers; live credentials не нужны.

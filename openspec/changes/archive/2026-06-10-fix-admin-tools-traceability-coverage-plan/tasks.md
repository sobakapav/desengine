## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Выполнено

- Затронутый capability: `admin-tools`.
- Закрытые scenarios: `Producer напрямую управляет исполнительским change`, `Producer появляется раньше формализованных требований и сценариев`, `Implement или fix напрямую подчиняется producer`.
- Уровень проверки: `unit` + `static/contract` через `npm run test:traceability`.
- Обновлённый evidence: `test/unit/openspec-roadmap-inheritance.test.ts`.
- Команды проверки: `npm run test:unit -- test/unit/openspec-roadmap-inheritance.test.ts test/unit/openspec-producer-list.test.ts`, `npm run test:traceability`.
- Mock/fixture-данные: временные OpenSpec fixture-директории в `os.tmpdir()`, live credentials не требуются.

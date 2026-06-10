## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [ ] 3. Выполнить внешнюю проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `architecture-roadmap`, `openspec-tooling`, `testing-layer`
- [x] Выбрать уровень проверки: `static/contract`, потому что change меняет только governance-документы и OpenSpec-артефакты
- [x] Подтвердить, что новые unit/component/integration тесты не требуются; проверка идёт через traceability и согласованность артефактов
- [x] Зафиксировать команду проверки: `npm run test:traceability`
- [x] Описать mock/fixture-данные и live credentials: не требуются

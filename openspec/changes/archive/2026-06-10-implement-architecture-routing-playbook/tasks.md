## Tasks

- [x] 1. Уточнить постановку и границы реализации для routing/naming/boundary playbook внутри `dispatcher-architecture`.
- [x] 2. Подготовить документы `docs/architecture` с practical guidance по маршрутизации downstream changes, naming discipline и interaction contract evidence.
- [x] 3. Синхронизировать metadata, handoff и verification contract change так, чтобы результат был готов к внешней проверке без внутреннего прогона.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `architecture-roadmap`: родитель получает operational playbook маршрутизации downstream changes по архитектурным границам.
- `admin-tools`: implement/fix change обязан иметь заполненный handoff и проверяемый verification contract.
- `testing-layer`: документационный behavior-change описывает понятный verification layer и evidence для boundary-сдвигов.

Уровни проверки:
- unit: обязательный.
- static/contract: дополнительный, остаётся на усмотрение внешней проверки change-линии.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команда запуска:
- `npm run test:unit -- test/unit/architecture-routing-playbook-docs.test.ts`

Mock/fixture-данные и credentials:
- Не требуются: проверяется документационный и tooling-контракт playbook-артефактов.

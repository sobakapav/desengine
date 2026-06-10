## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [ ] 3. Выполнить внешнюю проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `architecture-roadmap`: `Родитель маршрутизирует downstream change через dispatcher-architecture`.
- `architecture-roadmap`: `Предметный dispatcher остаётся owner, если граница уже определена`.
- `architecture-roadmap`: `Изменение архитектурной границы требует evidence-пакет`.
- `testing-layer`: `Тестовый файл покрывает OpenSpec-сценарий`.
- `admin-tools`: `Преflight не пускает implement/fix в исполнение без содержательного handoff`.

Уровни проверки:
- unit: обязательный внешний verification layer, потому что текущий блокер проявляется в runnable traceability metadata теста.
- static/contract: дополнительный sanity-слой для просмотра spec и handoff артефактов.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команда запуска:
- `npm run test:unit -- test/unit/architecture-routing-playbook-docs.test.ts`

Mock/fixture-данные и credentials:
- Не требуются: change синхронизирует OpenSpec contract и документационный unit evidence без внешних сервисов.

Отложенное покрытие:
- В `test/traceability/coverage-plan.json` добавлена запись для `architecture-roadmap`: текущий runnable слой закрывает только 3 routing/evidence scenarios, а roadmap/lifecycle scenarios вынесены в отдельный follow-up stage `architecture-roadmap-lifecycle-harness`.

## Tasks

- [ ] 1. Зафиксировать `focus-quality` как отдельный стратегический контур.
- [ ] 2. Перевести под `focus-quality` changes тестовой подсистемы:
  - [ ] 2.1 `dispatcher-test-system`
  - [ ] 2.2 `producer-test-system-current-state`
- [ ] 3. Взять под `focus-quality` quality-линии, которым нужен отдельный dispatcher:
  - [ ] 3.1 `dispatcher-ux`
- [ ] 4. Использовать `focus-quality` как родительский фокус для будущих quality/test/ux changes.
- [ ] 5. Следить, чтобы downstream changes имели понятную тестовую часть и не выпадали из traceability-контура.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: downstream quality-change обязан иметь явную тестовую часть и traceability-след.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, focus не меняет runtime.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change документирует governance-слой без runtime-изменений.

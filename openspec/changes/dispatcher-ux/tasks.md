## Tasks

- [ ] 1. Зафиксировать границы UX-контура качества и область ответственности `dispatcher-ux`.
- [ ] 2. Описать классы дочерних changes: producer, dispatcher, implement, cleanup, release follow-up.
- [ ] 3. Определить базовые guardrails для UX-line:
  - [ ] 3.1 UX-требования к коду рождаются только через downstream changes.
  - [ ] 3.2 UX-риск, пользовательский сценарий и способ проверки должны быть описаны человеко-понятно.
- [ ] 4. Связать будущие UX changes с traceability-практикой и тестовой частью behavior-change.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: downstream UX behavior-change обязан иметь явную тестовую часть и способ проверки.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, dispatcher не меняет runtime.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change документирует governance-слой без runtime-изменений.

Если покрытие откладывается:
- Не требуется: dispatcher не вводит runtime behavior.

## Tasks

- [ ] 1. Зафиксировать границы подсистемы тестирования и её область ответственности.
- [ ] 2. Описать классы дочерних changes: producer, implement, cleanup, release follow-up.
- [ ] 3. Зафиксировать, что runtime/tooling изменения тестового слоя выполняются только через контролируемые dispatcher'ом `implement`/`fix` changes.
- [ ] 4. Определить базовые guardrails для уровней проверки, команд запуска, mock/fixture-данных и live credentials.
- [ ] 5. Связать будущие изменения тестовой подсистемы с `testing-layer` и traceability-практикой.
  - [ ] 5.1 integration foundation wave: `implement-integration-test-runner-foundation`
  - [ ] 5.2 route fixture wave: `implement-route-integration-fixture-wave`
  - [ ] 5.3 live preflight wave: `implement-live-provider-test-preflight`
  - [ ] 5.4 traceability remediation wave: `fix-test-spec-coverage-map-completeness`
- [ ] 6. Заполнить handoff и поддерживать его в состоянии, пригодном для передачи исполнения downstream changes.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: тестовая подсистема получает отдельный управляющий change, который направляет code changes через downstream `implement`/`fix`.

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

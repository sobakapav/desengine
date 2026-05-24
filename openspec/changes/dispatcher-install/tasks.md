## Tasks

- [ ] 1. Зафиксировать границы install/setup/tooling-контура.
- [ ] 2. Описать классы дочерних changes:
  - [ ] 2.1 docs-adjacent setup fixes остаются у `dispatcher-doc`;
  - [ ] 2.2 technical setup fixes переходят в `dispatcher-install`;
  - [ ] 2.3 smoke/preflight/onboarding-sync fixes формулируются как downstream `fix` changes.
- [ ] 3. Зафиксировать базовые guardrails для install-line:
  - [ ] 3.1 setup bug должен иметь воспроизводимый локальный сценарий;
  - [ ] 3.2 fix должен указывать команду проверки;
  - [ ] 3.3 tooling и config-contract не должны расходиться молча.
- [ ] 4. Поддерживать handoff и roadmap install-контура в пригодном состоянии.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: downstream install behavior-change обязан иметь явную тестовую часть и traceability-след.

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
- Не требуются.

## Tasks

- [ ] 1. Зафиксировать границы документационного контура и область ответственности `dispatcher-doc`.
- [ ] 2. Описать классы дочерних changes:
  - [ ] 2.1 `fix-*` для устранения documentation drift вокруг наблюдаемого поведения.
  - [ ] 2.2 `implement-*` для случаев, когда правдивая документация требует сопутствующего изменения runtime, tooling или test guidance.
  - [ ] 2.3 `producer-*` для системных пробелов документационной линии и её roadmap.
- [ ] 3. Зафиксировать границу между `dispatcher-doc` и `dispatcher-help`.
- [ ] 4. Определить правило маршрутизации:
  - [ ] 4.1 редакторские правки без изменения контракта не обязаны становиться отдельным dispatcher-driven change;
  - [ ] 4.2 drift вокруг наблюдаемого поведения, инженерных правил и тестового guidance обязан оформляться через downstream change.
- [ ] 5. Зафиксировать обязательную тестовую часть для downstream documentation changes.
- [ ] 6. Поддерживать `handoff.md` в состоянии, пригодном для передачи активных дочерних changes документационной линии.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `external-local-onboarding`: локальные инструкции и operator-facing документы должны описывать систему правдиво и без drift.
- `testing-layer`: downstream documentation changes обязаны явно описывать способ проверки, если документируют наблюдаемое поведение или anti-regression guardrails.
- `help-content`: in-app help остаётся отдельной линией и не подменяет внешний документационный контракт.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется для самого dispatcher.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change документирует governance-слой и правила маршрутизации без runtime-изменений.

Если покрытие откладывается:
- Не требуется для самого dispatcher; downstream behavior-change обязан либо дать runnable-проверку, либо явно зафиксировать причину в traceability-плане.

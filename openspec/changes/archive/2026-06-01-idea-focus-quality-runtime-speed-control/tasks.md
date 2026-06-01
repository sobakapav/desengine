## Tasks

- [ ] 1. Зафиксировать speed-quality как отдельную линию внутри `focus-quality`.
- [ ] 2. Описать, какие жалобы на скорость допускаются как входные сигналы.
- [ ] 3. Подготовить downstream change, который определит:
  - [ ] 3.1 baseline критичных latency-сценариев;
  - [ ] 3.2 способ сбора evidence и воспроизводимого perf-report;
  - [ ] 3.3 границу между subjective slowdown и подтверждённым performance issue;
  - [ ] 3.4 правила перевода performance-жалобы в `fix`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: performance-quality может потребовать отдельные evidence и quality gates.
- `level-labs`: потенциальный future-contract на latency лабораторных сценариев.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, idea не меняет runtime.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются.

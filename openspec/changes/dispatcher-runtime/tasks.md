## Tasks

- [x] 1. Зафиксировать `dispatcher-runtime` как tactical owner линии укрепления lab runtime.
- [x] 2. Отделить runtime-line от `dispatcher-event-envelope` и других соседних dispatcher.
- [x] 3. Перепривязать `implement-lab-runtime-contract-hardening` к `dispatcher-runtime`.
- [x] 4. Связать dispatcher с roadmap `focus-tech/roadmaps/architecture-transformation.md` и producer `producer-architecture-transformation`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `architecture-roadmap`: runtime-foundation line получает отдельный tactical dispatcher.
- `testing-layer`: implement changes этой линии сохраняют явный verification layer.

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
- Не требуются: change описывает governance и ownership runtime-линии.

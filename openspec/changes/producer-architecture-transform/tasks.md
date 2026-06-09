## Tasks

- [ ] 1. Зафиксировать `producer-architecture-transform` как продюсерскую линию пользовательски значимой архитектурной трансформации.
- [ ] 2. Передать producer рабочую архитектурную карту: слои, сквозные сущности и роль `AI-трансформации`.
- [ ] 2.1. Явно закрепить, что на текущем этапе список сквозных сущностей ограничен: `код`, `LLM`, `бюджет`, `дизайн`.
- [ ] 2.2. Явно закрепить, что `AI-трансформация` трактуется как vision/обещание, а не как пятая сущность или частный onboarding-механизм.
- [ ] 3. Зафиксировать implementation plan и порядок downstream waves.
- [ ] 3.1. Закрепить, что `сессия работы` пока остаётся частью `рабочего места`.
- [ ] 3.2. Закрепить, что `верстак` не считается автоматически равным одному `шагу`.
- [ ] 4. Создать и привязать `dispatcher-architecture` как tactical owner архитектурной линии.
- [ ] 5. Зафиксировать правила ADR, модульных границ, архитектурного именования и явного кодового существования сущностей.
- [ ] 6. Подготовить producer к порождению downstream `implement-*` / `fix-*` / дополнительных `dispatcher-*` changes.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `architecture-transform`: producer фиксирует пользовательски значимую архитектурную трансформацию.
- `architecture-roadmap`: producer передаёт implementation plan в downstream architectural line.
- `testing-layer`: downstream behavior-change changes этой линии обязаны иметь явную verification-часть.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change описывает governance и implementation plan, не runtime behavior.

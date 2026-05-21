## Tasks

- [ ] 1. Обновить legacy imports локального конфига во всех затронутых setup-tools.
- [ ] 2. Проверить, что `smoke`, `repair-onboarding` и `allowlist-marker` используют единый канонический путь.
- [ ] 3. Добавить unit/source-contract проверки против регресса.
- [ ] 4. Обновить OpenSpec/traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `external-local-onboarding`: smoke/setup flow должен доходить до реальной проверки окружения.
- `resource-status`: tooling не должен рушиться на отсутствующем legacy-module.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit && npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются сверх локальных fixture/tool source-contract проверок.

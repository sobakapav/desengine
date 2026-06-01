## Tasks

- [x] 1. Сопоставить runtime onboarding layout contract и текущие smoke/repair validators.
- [x] 2. Убрать ожидание `onboarding/prompts/default.md` из tooling, где runtime уже канонизировал `default.njk`.
- [x] 3. Добавить защиту от повторного дрейфа runtime и CLI validators.
- [x] 4. Обновить тесты и документацию smoke/onboarding preflight.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `external-local-onboarding`: локальная документация и onboarding-поток не противоречат друг другу.
- `onboarding-repo`: onboarding layout должен считаться полным при корректном prompt-layer.

Уровни проверки:
- integration: обязательный.
- unit: обязательный source-contract guard для smoke/repair против legacy `default.md`.
- unit: отдельный validator-path guard с минимальным fixture layout, который проверяет принятие `default.njk` и отказ для legacy-only `default.md` одновременно в runtime, smoke и repair.

Команды запуска:
- `npm run test:unit -- test/unit/p2-source-contracts.test.ts`
- `npm run test:unit -- test/unit/onboarding-prompt-templates.test.ts`
- `npm run smoke`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- unit-слой использует репозиторные исходники без внешних fixture;
- smoke использует локальный onboarding layout и штатный preflight с `ONBOARDING_REPO_URL`.

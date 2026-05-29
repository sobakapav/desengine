## Tasks

- [ ] 1. Сопоставить runtime onboarding layout contract и текущие smoke/repair validators.
- [ ] 2. Убрать ожидание `onboarding/prompts/default.md` из tooling, где runtime уже канонизировал `default.njk`.
- [ ] 3. Добавить защиту от повторного дрейфа runtime и CLI validators.
- [ ] 4. Обновить тесты и документацию smoke/onboarding preflight.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `external-local-onboarding`: локальная документация и onboarding-поток не противоречат друг другу.
- `onboarding-repo`: onboarding layout должен считаться полным при корректном prompt-layer.

Уровни проверки:
- integration: обязательный.
- unit: желателен для самого validator/helper.

Команды запуска:
- `npm run smoke`
- `npm run test:unit -- test/unit/onboarding-prompt-templates.test.ts`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- используется локальный onboarding layout и штатный smoke preflight.

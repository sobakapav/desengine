## Tasks

- [x] 1. Зафиксировать в OpenSpec и документации distinction между deterministic unit-фикстурами и real onboarding smoke.
- [x] 2. Усилить runnable smoke/integration-контракт реального onboarding checkout.
- [x] 3. Добавить защиту от повторного “ложно зелёного” состояния, когда unit проходит, а реальный onboarding contract уже несовместим.
- [x] 4. Обновить тестовый слой, команды и диагностику для внешней проверки onboarding.
- [ ] 5. Закрыть change через внешнюю проверку smoke и связанных unit-guard'ов.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `testing-layer`, `external-local-onboarding`, `onboarding-repo`.
- [x] Выбрать уровень проверки: integration + static/contract + unit.
- [x] Зафиксировать команду запуска: `npm run smoke`.
- [x] Зафиксировать дополнительный deterministic guard: `npm run test:unit -- test/unit/onboarding-prompt-templates.test.ts`.
- [x] Описать mock/fixture и live условия: unit-слой использует временные фикстуры и repo-owned контракты; smoke использует реальный onboarding checkout и требует `ONBOARDING_REPO_URL` в локальной конфигурации.
- [x] Добавить или обновить smoke/integration проверки и документацию тестового слоя.
- [x] Если часть real-checkout покрытия останется вне первой версии, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия. В этой версии запись не потребовалась: добавленные unit-guard'ы и документация покрывают введённый контракт.

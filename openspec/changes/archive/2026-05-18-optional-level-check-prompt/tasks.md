## 1. Контракт

- [x] 1.1 Зафиксировать optional-поведение `check.md` в `llm` и `onboarding-repo`

## 2. Runtime

- [x] 2.1 Сделать `readLevelCheckPrompt` tolerant к отсутствующему файлу
- [x] 2.2 Сохранить включение существующего `check.md` в checking instruction

## 3. Тестирование

- [x] 3.1 Добавить unit/source-contract на optional `check.md`
- [x] 3.2 Запустить `npm run test:unit -- --run test/unit/llm-flow-source-contract.test.ts`

## Тестовая часть

- Capability/scenarios: `llm` — `Система выполняет checking prompt lookup для уровня`, `Hidden prompt проверки уровня отсутствует`; `onboarding-repo` — `Автор onboarding-уровня не добавляет prompt проверки`.
- Уровень проверки: unit/static source-contract.
- Команда запуска: `npm run test:unit -- --run test/unit/llm-flow-source-contract.test.ts`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.

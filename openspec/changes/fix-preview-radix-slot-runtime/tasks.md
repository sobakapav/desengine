## Tasks

- [x] 1. Локализовать причину preview-runtime ошибки для `@radix-ui/react-slot` и проверить, как Sandpack builder выбирает версии пакетов.
- [x] 2. Перевести Sandpack dependency graph на exact installed версии для прямых runtime-зависимостей.
- [x] 3. Обновить unit-регрессию для preview dependency contract.
- [x] 4. Зафиксировать поведенческий контракт в OpenSpec.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios:
  - `task` / `Sandpack preview использует project.uiKitId`
  - `task` / `Preview фиксирует exact installed версии runtime-зависимостей`
- [x] Уровень проверки: `unit`
- [x] Команда проверки: `npm run test:unit -- test/unit/sandpack-preview.test.ts`
- [x] Mock/fixture-данные:
  - используются repository shadcn source files из `components/ui/**`
  - regression покрывает `AlertDialog`-импорты через Sandpack payload builder
- [x] Live credentials не нужны

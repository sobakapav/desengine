## 1. Реализация

- [x] 1.1 Добавить конфигурационный файл контента системных ресурсов.
- [x] 1.2 Добавить общий resolver ресурсов с подстановкой переменных и сборкой инструкции.
- [x] 1.3 Переписать сборку статусов в `lib/system/resources/internalstate.ts` на выбор condition ресурсов вместо ручной сборки текстов.
- [x] 1.4 Обновить рендер карточки ресурса для Markdown-ссылок в описании.
- [x] 1.5 Переименовать публичные и внутренние resource-state модули: `internalstate.ts`, `publicstate.ts`, `getResourceStates`.
- [x] 1.6 Перенести системную конфигурацию из `lib/config` в `lib/system/config`.
- [x] 1.7 Добавить встроенные контролы исправления для ресурсов `access-session` и `onboarding-content`.
- [x] 1.8 Добавить системный ресурс версии системы с проверкой Git-релизов и кнопкой `Обновить`.

## 2. Проверка

- [x] 2.1 Добавить unit-тесты resolver ресурсов.
- [x] 2.2 Привязать тесты к OpenSpec capability/scenarios `resource-status`.
- [ ] 2.3 Запустить `npm run test:unit` до зелёного результата.
- [x] 2.4 Запустить `npm run test:traceability`.
- [x] 2.5 Добавить unit-проверку условий показа встроенных контролов исправления.
- [x] 2.6 Добавить unit-проверку сравнения релизных тегов системы и dev-состояния.

Примечание: `npm run test:unit` запущен, но общий suite сейчас падает на существующих source-contract проблемах вне этого change. Целевые unit-тесты `test/unit/resource-status.test.ts` и связанный `test/unit/llm-flow-source-contract.test.ts` проходят через `npx vitest run --project unit test/unit/resource-status.test.ts test/unit/llm-flow-source-contract.test.ts`.

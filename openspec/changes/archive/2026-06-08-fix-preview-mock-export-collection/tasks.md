## 1. Реализация

- [x] Обновить App template preview, чтобы он умел собирать список props из нескольких named exports `mock.ts`.
- [x] Сохранить обратную совместимость с `mockProps` и `mock`.
- [x] Выровнять fallback-template с тем же runtime-контрактом.

## 2. Тестовый слой

- [x] Обновить unit coverage для template/read-path и preview payload.
- [ ] Передать change на внешнюю проверку командой `npm run test:unit -- test/unit/sandpack-preview.test.ts test/unit/sandpack-template.test.ts`.

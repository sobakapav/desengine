## Tasks

- [x] 1. Локализовать auth latency до последовательного ожидания LLM и allowlist resource probes.
- [x] 2. Добавить failing unit, который доказывает serial execution и падает без фикса.
- [x] 3. Перевести `getResourceStates()` на параллельный запуск независимых probes без изменения resource contract.
- [x] 4. Удержать стабильный порядок resource cards при параллельных probes и подтвердить это unit-слоем.
- [x] 5. Передать change на внешнюю проверку и зафиксировать итоговый verdict в handoff.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `resource-status`: `Авторизация не ждёт sequential network probes диагностики`
- `resource-status`: `Разработчик запускает unit-проверку статусов ресурсов`

Уровни проверки:
- unit: обязательный
- component/browser: не обязателен для этого narrow runtime slice, потому что change не меняет UI contract и удерживает только orchestration boundary
- integration: не требуется отдельно
- live/provider: не требуется

Команды запуска:
- `npm run test:unit -- test/unit/resource-internalstate.test.ts test/unit/resource-status.test.ts`

Mock/fixture-данные и credentials:
- Live credentials не нужны.
- Новый unit использует module mocks для `getResourceStates()` dependencies и не требует реального LLM/allowlist окружения.

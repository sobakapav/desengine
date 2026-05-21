## Tasks

- [x] 1. Уточнить постановку и границы реализации: довести `component-sourcing` до enforceable source-contract слоя без добавления новых зависимостей.
- [x] 2. Добавить активный OpenSpec spec `component-sourcing` и синхронизировать change-локальные specs.
- [x] 3. Расширить `WorkbenchSourcingDecision` полем fallback/degradation strategy и ужесточить registry validation.
- [x] 4. Обновить lab workbench registry и unit-тесты для `component-sourcing` / `workbench-tools`.
- [ ] 5. Выполнить внешнюю проверку по `verification_command` из metadata и `npm run test:traceability`.

## Тестовая часть change

Затронутые capability/scenarios:
- [x] `component-sourcing`:
- [x] `Команда добавляет новый Workbench tool`
- [x] `Готовая библиотека не должна протекать в домен`
- [x] `workbench-tools`:
- [x] `Добавляется новый локальный tool`
- [x] `Workbench tool фиксирует sourcing decision`

Уровни проверки:
- [x] static/contract: обновление `openspec/specs/**`
- [x] unit: `test/unit/workbench-platform-registry.test.ts`

Команды запуска:
- [x] `npm run test:unit`
- [x] `npm run test:traceability`

Mock/fixture-данные и credentials:
- [x] Не нужны; проверки работают на локальных in-memory данных и чтении исходников.

Покрытие:
- [x] Отдельный coverage-plan не нужен, так как change добавляет runnable unit-contract слой для новых scenarios.

## Tasks

- [x] 1. Зафиксировать текущий дефект preview/runtime для 11 исключённых компонентов из `components/ui`.
- [x] 2. Локализовать для каждого проблемного компонента недостающие runtime-зависимости:
- [x] 2.1 Проверить внешние npm-пакеты, которых не хватает в `sandpack-ui-kits.config.ts`.
- [x] 2.2 Проверить локальные `components/ui/*` и связанные helper/source files, которые должны попадать в виртуальный проект вместе с компонентом.
- [x] 3. Обновить dependency-resolution Sandpack preview так, чтобы эти компоненты распознавались как поддерживаемые без выпиливания из индекса.
- [x] 4. Вернуть компоненты в экспортный surface только после подтверждения, что runtime больше не считает их неподдерживаемыми из-за недоописанных зависимостей.
- [x] 5. Обновить handoff итоговой конкретикой: какие зависимости были добавлены, какие компоненты снова считаются поддерживаемыми и какие ограничения остались.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task`: `Preview принимает UI-импорты из components/ui`
- `task`: `Sandpack preview использует project.uiKitId`

Уровни проверки:
- unit: обязательный
- component/browser: по необходимости, если unit-слой не сможет доказать корректную сборку dependency graph
- integration: не требуется по умолчанию
- e2e smoke: не требуется по умолчанию
- live/provider: не требуется

Команды запуска:
- `npm run test:unit -- test/unit/sandpack-preview.test.ts`
- при появлении отдельного точечного unit/spec файла его нужно явно добавить в handoff и verification_command

Mock/fixture-данные и credentials:
- Нужны только локальные fixture/source snippets для preview builder.
- Live credentials не требуются.

Правило на случай отложенного покрытия:
- Если часть из 11 компонентов не удастся закрыть в этом fix без отдельного runtime-подchange, это нужно явно зафиксировать в `test/traceability/coverage-plan.json` или выделить в отдельный downstream fix с причиной дробления.

## Tasks

- [x] 1. Локализовать browser/dev overlay путь, где benign cancellation из Monaco всплывает как `unhandledrejection`, хотя редактор остаётся рабочим.
- [x] 2. Обновить `components/desengine/lab/Code/MonacoCodeEditor.tsx`, чтобы suppression применялся только к `Canceled` с Monaco stack и жил только рядом с editor wrapper.
- [x] 3. Добавить regression test `test/unit/monaco-cancellation-noise.test.ts`, который явно фиксирует, какие причины считаются benign Monaco cancellation, а какие нет.
- [x] 4. Добавить source-contract guard в `test/unit/p1-source-contracts.test.ts`, чтобы listener на `unhandledrejection` ставился и снимался в Monaco editor path.
- [x] 5. Добавить запись в `openspec/changes/release-2026-06-02-quality/release-notes.md` с пользовательским описанием эффекта и понятной проверкой.
- [x] 6. Передать change на внешнюю проверку командой `npm run test:unit -- test/unit/monaco-cancellation-noise.test.ts test/unit/p1-source-contracts.test.ts`.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios:
  - `level-labs` / `Пользователь открывает лабораторию уровня`
  - `level-labs` / `Monaco не загрузился`
- [x] Выбрать уровень проверки: `unit` + `source-contract`
- [x] Зафиксировать команду запуска: `npm run test:unit -- test/unit/monaco-cancellation-noise.test.ts test/unit/p1-source-contracts.test.ts`
- [x] Описать mock/fixture-данные: unit-тест передаёт в helper искусственные rejection-объекты с разными `name`, `message` и `stack`; source-contract тест читает `components/desengine/lab/Code/MonacoCodeEditor.tsx` как исходник и проверяет наличие локального listener lifecycle без реального браузерного рантайма.
- [x] Live credentials не нужны
- [x] Если финальная runnable-проверка не выполнена агентом-исполнителем, оставить её на внешнюю проверку

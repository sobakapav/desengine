## Tasks

- [ ] 1. Добавить Radix UI как отдельный kit в конфиг Sandpack UI kit'ов.
- [ ] 2. Проверить/добавить зависимости в `package.json` (минимальный набор для smoke).
- [ ] 3. Smoke-пример (например, `@radix-ui/react-dialog` или аналогичный компонент).
- [ ] 4. Тесты: unit + traceability (+ e2e smoke при необходимости).
- [ ] 5. Команды проверки: `npm run test:unit`, `npm run test:traceability` (и `npm run test:e2e` если добавлен).

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run ...`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия


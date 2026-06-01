## Tasks

- [ ] 1. Добавить Mantine в конфиг Sandpack UI kit'ов (id/title/dependencies/импорты).
- [ ] 2. Добавить недостающие зависимости в корневой `package.json` (good enough для работы).
- [ ] 3. Добавить минимальный smoke-пример/сценарий, который рендерит Mantine-компонент в Sandpack preview.
- [ ] 4. Тесты:
  - [ ] 4.1 Unit: конфиг валиден, `uiKitId` резолвится, зависимости мерджатся.
  - [ ] 4.2 Traceability: связать сценарий подключения Mantine с тестами.
  - [ ] 4.3 (опционально) E2E smoke: переключение на Mantine в лаборатории.
- [ ] 5. Команды проверки:
  - [ ] 5.1 `npm run test:unit`
  - [ ] 5.2 `npm run test:traceability`
  - [ ] 5.3 (если добавлен e2e) `npm run test:e2e`

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run ...`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия


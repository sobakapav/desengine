## 1. Файловый слой help-контента

- [x] 1.1 Создать корневой каталог `help/` с примерной Markdown-страницей, `help/images/` и `help/mermaid/`
- [x] 1.2 Реализовать `lib/help/content.ts` для безопасного чтения help-страниц, H1, сортировки, картинок и Mermaid-файлов
- [x] 1.3 Обновить `lib/help/navigation.ts` фабриками URL для страницы, ошибки, картинки и Mermaid

## 2. Route-реализация

- [x] 2.1 Заменить `/help` на каталог ссылок из `help/*.md`
- [x] 2.2 Добавить `/help/[helpId]` с рендером Markdown через `MarkdownContent`
- [x] 2.3 Добавить `/help/error` как отдельную защищённую страницу ошибки
- [x] 2.4 Добавить `/help/images/[imgId]` для защищённой выдачи картинок
- [x] 2.5 Добавить `/help/mermaid/[mermaidId]` для защищённого рендера Mermaid через `MermaidDiagram`

## 3. Тестовая часть change

- [x] 3.1 Указать затронутые OpenSpec capability/scenarios: `help-content` и `access-control`
- [x] 3.2 Выбрать уровень проверки: static/contract + unit + e2e smoke
- [x] 3.3 Добавить или обновить тесты в общем слое тестирования
- [x] 3.4 Зафиксировать команду проверки: `npm run test:unit`, `npm run test:traceability`, `npm run test:e2e`
- [x] 3.5 Описать mock/fixture-данные и live credentials, если они нужны
- [x] 3.6 Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия

Покрытие change:

- Capability/scenarios: `help-content` покрывает каталог `help/*.md`, H1/fallback, сортировку, чтение Markdown, картинки и Mermaid; `access-control` покрывает route-level guard для help-страниц и unauthorized guard для help-картинки.
- Уровни проверки: static/contract + unit (`test/unit/help-content.test.ts`, `test/unit/access-route-guards.test.ts`), e2e smoke (`test/e2e/route-smoke.spec.ts`).
- Команды: `./node_modules/.bin/vitest run --project unit test/unit/help-content.test.ts test/unit/access-route-guards.test.ts`, `npm run test:traceability`, `npm run build`, `npm run test:e2e -- test/e2e/route-smoke.spec.ts --grep "/help|help asset"`.
- Mock/fixture-данные: unit-тест создаёт временный каталог help в `/tmp`; runtime-fixture лежит в `help/start.md`, `help/images/help-placeholder.svg`, `help/mermaid/help-flow.mmd`; live credentials не нужны.
- Отложенного покрытия нет, запись в `test/traceability/coverage-plan.json` не требуется.

## 4. Проверка и завершение

- [x] 4.1 Запустить unit/traceability проверки для нового поведения
- [x] 4.2 Проверить help-страницы локально в браузере
- [x] 4.3 Обновить task-чекбоксы по фактически выполненной работе

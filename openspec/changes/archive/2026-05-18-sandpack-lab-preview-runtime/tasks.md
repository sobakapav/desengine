## 1. Подготовка Sandpack-preview

- [x] 1.1 Добавить зависимость `@codesandbox/sandpack-react` без изменения install-critical стека
- [x] 1.2 Создать адаптер виртуальных Sandpack-файлов для `Component.tsx`, `styles.ts`, `mock.ts`, `props.ts` и entry-файлов preview
- [x] 1.3 Подключить в виртуальный проект настоящий `components/ui/badge.tsx` и его локальные зависимости
- [x] 1.4 Подключить Tailwind CSS и базовые CSS tokens внутри виртуального preview-проекта

## 2. Замена render-слоя

- [x] 2.1 Перевести `OutRender` на `SandpackProvider` и `SandpackPreview`
- [x] 2.2 Сохранить текущие состояния: preview недоступен до старта, загрузка, управляемая ошибка сборки/рендера
- [x] 2.3 Убедиться, что сохранение файла обновляет preview через существующий `reloadKey`
- [x] 2.4 Удалить или перестать использовать самодельный `/api/tasks/:taskId/module` runtime, если после миграции он не нужен

## 3. Тестовая часть change

- [x] 3.1 Указать затронутые OpenSpec capability/scenarios: `level-labs` и `ui-foundation`
- [x] 3.2 Выбрать уровень проверки: unit/contract для Sandpack-файлов и browser smoke для preview
- [x] 3.3 Добавить или обновить тесты в общем слое тестирования
- [x] 3.4 Зафиксировать команды проверки: `npm run test:unit -- test/unit/sandpack-preview.test.ts`, `npm run test:traceability`, `npm run build`, локальный browser smoke `/lab/mp-inspector-divider-vks`
- [x] 3.5 Описать mock/fixture-данные: задача `mp-inspector-divider-vks`, `Component.tsx` с `<Badge variant="ghost">`, live credentials не нужны
- [x] 3.6 Покрытие не откладывается: запись в `test/traceability/coverage-plan.json` не требуется

## 4. Проверка и завершение

- [x] 4.1 Запустить unit/traceability проверки нового preview-runtime
- [x] 4.2 Проверить локально `/lab/mp-inspector-divider-vks`: `variant="ghost"` влияет на настоящий `Badge`
- [x] 4.3 Обновить task-чекбоксы по фактически выполненной работе

# Tasks: fix-lab-editor-width

## 1. Контракт

- [ ] 1.1 Добавить delta в OpenSpec для capability `level-labs`: desktop-редактор занимает только доступную ширину и не раздувает рабочее полотно.
- [ ] 1.2 Зафиксировать тестовую часть change: unit/source-contract + traceability, с понятными командами запуска.

## 2. Реализация

- [ ] 2.1 Ограничить editor-pane по ширине в layout контейнерах Workbench.
- [ ] 2.2 Зафиксировать desktop-поведение списка файлов как боковой колонки, не раздувающей редакторную область.

## 3. Проверки

- [ ] 3.1 Добавить unit/source-contract тест на layout-ограничения редактора лаборатории.
- [ ] 3.2 Запустить `npm run test:unit`.
- [ ] 3.3 Запустить `npm run test:traceability`.

## 4. Приёмка

- [ ] 4.1 Редактор лаборатории на desktop больше не растягивает рабочую область по ширине.
- [ ] 4.2 Редактор занимает максимум доступного места внутри своей колонки.
- [ ] 4.3 Контракт покрыт автоматической проверкой и включён в traceability-слой.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `level-labs`: `Пользователь открывает рабочий экран на desktop`, `Пользователь открывает лабораторию уровня`.
- `testing-layer`: behavior-change имеет явный unit/source-contract след и traceability.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: желателен позже, но не обязателен для этого fix.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: fix касается локального layout-контракта и source-code структуры.

Если покрытие откладывается:
- Не требуется, если source-contract тест добавлен в этом change.

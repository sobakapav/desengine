## 1. Базовая инфраструктура Konva

- [ ] 1.1 Добавить зависимости `konva` и `react-konva` (без изменения install-critical инфраструктуры).
- [ ] 1.2 Добавить базовый компонент `KonvaImageInspector` (только отображение изображения, без оверлеев).
- [ ] 1.3 Добавить управление viewport: fit, zoom, pan, reset.
- [ ] 1.4 Добавить быстрый экспорт метаданных `ImageInspectorMeta` через `onMetaReady` (в первую очередь `naturalWidth/naturalHeight`).
  - примечание: на первом этапе не передаём наружу viewport; добавим только если появится конкретный кейс.

## 2. Оверлеи и экспорт данных

- [ ] 2.1 (опционально, позже) Определить `ImageInspectorState` (image/view/overlays) и стабилизировать формат.
- [ ] 2.2 (опционально, позже) Реализовать слой оверлеев и хотя бы один инструмент (например, `rect`).
- [ ] 2.3 (минимум) Реализовать экспорт: «копировать JSON метаданных» (`ImageInspectorMeta`).

## 3. Интеграция в UI

- [ ] 3.1 Интегрировать инспектор для картинок из markdown (`components/desengine/system/MarkdownContent/MarkdownContent.tsx`) с безопасным fallback.
- [ ] 3.2 Интегрировать инспектор в лабораторные картинки (`components/desengine/lab/InOut/InPicture/InPicture.tsx`).
- [ ] 3.3 Добавить фичефлаг/переключатель, чтобы можно было включать инспектор поэтапно.
- [ ] 3.4 Подключить инспектор на странице задачи и на странице перехода на следующий уровень (конкретные компоненты уточнить по месту).

## 4. Документация и OpenSpec

- [ ] 4.1 Обновить/уточнить OpenSpec capability/scenarios, затронутые изменением (`level-labs`, `ui-foundation`, новый `image-inspector`).
- [ ] 4.2 Зафиксировать контракт `ImageInspectorState` в OpenSpec (как минимум в design + при необходимости в `openspec/specs/**`).

## 5. Тестовая часть change (обязательная)

- [ ] Указать затронутые OpenSpec capability/scenarios
  - capability: `level-labs`
    - scenario: "Пользователь видит изображения уровня и может открыть инспектор"
  - capability: `image-inspector` (новая)
    - scenario: "Пользователь делает zoom/pan и экспортирует JSON метаданных (`naturalWidth/naturalHeight`)"
- [ ] Выбрать уровень проверки
  - component/browser + e2e smoke (Playwright): проверка открытия инспектора, зума/пана, добавления оверлея, экспорта JSON
  - static/traceability: привязка сценариев к тестам
- [ ] Добавить или обновить тесты в общем слое тестирования
  - e2e: добавить новый spec (например, `tests/e2e/image-inspector.spec.ts`) или расширить существующий сценарий, где уже отображаются изображения
  - component (если есть инфраструктура): добавить тесты на преобразование координат и сериализацию `ImageInspectorState`
- [ ] Зафиксировать команду проверки
  - минимум: `npm run test:e2e && npm run test:traceability`
  - при добавлении unit: `npm run test:unit && npm run test:e2e && npm run test:traceability`
- [ ] Описать mock/fixture-данные и live credentials
  - fixtures: использовать существующие PNG из task-catalog (`/api/tasks/:taskId/image?imageId=...`)
  - live credentials не нужны
- [ ] Если покрытие откладывается
  - добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия

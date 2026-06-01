## Workbench: минимальный контракт (эскиз)

- `WorkbenchDefinition`:
  - `id`
  - `title`
  - `applicability` (для каких `taskType` и/или `workflowStep.kind`)
  - `tools[]` (список инструментов)
  - `panels/layout` (описание структуры UI, минимум — декларативно)
  - `inputs` (какие артефакты требуются)
  - `outputs` (какие артефакты создаёт)

- `WorkbenchInstance`:
  - `id`
  - `definitionId`
  - `taskId`
  - `workflowInstanceId?`
  - `workflowStepId?`
  - `state` (сериализуемое состояние)
  - `createdAt/updatedAt`

## Инструменты верстака

Контракт инструмента (эскиз):

- `id`, `title`, `icon?`
- `isApplicable(context) -> boolean`
- `render(context)` (UI)
- `actions[]` (операции)
- `serializeState()` / `hydrateState()` (опционально)

## Image Inspector как встроенное направление

Image inspector не должен жить как отдельные `producer` и `dispatcher` changes. Это частный набор инструментов внутри общей workbench-линии:

- инспектор открывается как панель или режим workbench;
- его состояние подчиняется общей модели `WorkbenchInstance.state`;
- image tools подключаются через тот же registry и тот же contract `tools[]`.

Типовые кейсы image-inspector, которые workbench должен помнить:

- быстро посмотреть изображение: оригинал, масштаб, размеры, формат;
- сравнить варианты: side-by-side, overlay diff, sync zoom;
- снять измерения: пипетка, расстояния, сетка, направляющие;
- проверить качество: контраст, читаемость, артефакты, palette drift;
- локально сохранить результаты инструмента как воспроизводимый output workbench.

MVP-набор image tools, который стоит держать в памяти линии:

- zoom/pan + fit-to-screen;
- пипетка цвета с историей;
- линейки/измерения и сетка;
- сравнение двух изображений side-by-side с синхронным масштабом.

Более продвинутые image tools могут появляться дальше:

- overlay/pixel diff;
- contrast/WCAG checks;
- palette extraction и поиск близких цветов;
- accessibility- и quality-эвристики.

## Layout/Space как встроенное направление

Layout/space workbench не должен жить как отдельный параллельный dispatcher. Это частный продуктовый срез внутри общей сущности Workbench:

- layout-сценарии используют тот же registry и ту же модель `WorkbenchDefinition/Instance`;
- layout tools подключаются как частный набор инструментов общего workbench-контракта;
- решение о том, является ли layout отдельным шагом workflow или внутренним tool-набором, принимается downstream, но в рамках одного dispatcher `dispatcher-workbench`.

Для этого dispatcher использует второй inherited roadmap: `focus-features/roadmaps/workbench-layout-space.md`.

## Входы/выходы (артефакты)

Workbench должен:

- получать входные артефакты из Task/Workflow;
- производить выходные артефакты и сохранять их обратно в Task.

Важно: артефакты — first-class и должны быть трассируемыми (источник/версия/время).

## Навигация

MVP сценарии:

- открыть задачу → открыть верстак текущего шага;
- перейти на другой шаг → переключить верстак (с сохранением состояния);
- вернуться назад → восстановить состояние верстака.

## Тестирование (план)

- Unit/contract: выбор верстака по задаче/шагу, сериализация состояния, применимость инструментов.
- Component/browser: базовые интеракции верстака и 1–2 инструментов, включая layout и image-inspector tools.
- E2E smoke: создать задачу → открыть верстак → выполнить действие → артефакт сохранился.

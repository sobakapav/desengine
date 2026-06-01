## Context

В active OpenSpec уже есть runtime/spec-основание для Workbench и связанного workflow-контракта. Этот dispatcher не заменяет их и не создаёт новую параллельную capability, а задаёт управляемую рамку для дальнейшего развития workbench-линии внутри `focus-domain`.

Особенно важно зафиксировать две границы:

- layout/space workbench не должен развиваться как отдельный параллельный dispatcher;
- image inspector не должен распадаться на самостоятельные producer/dispatcher changes вне общей workbench-линии.

## Goals

- Зафиксировать минимальный контракт Workbench как общей продуктовой сущности.
- Удержать связь Workbench ↔ Task ↔ WorkflowStep как основу downstream runtime-изменений.
- Зафиксировать контракт инструментов верстака и реестр подключений.
- Определить место layout/space и image inspector внутри общей workbench-линии.
- Сформировать понятный тестовый и traceability-контур для следующих behavior-change changes.

## Non-goals

- Реализовать сразу множество верстаков или инструментов.
- Переписать существующий runtime в рамках этого dispatcher.
- Закрыть все UX-детали на первом шаге вместо фиксации рамки и границ.
- Превратить image inspector или layout/space в отдельные независимые линии управления.

## Decisions

### Workbench как зонтичная сущность

Workbench трактуется как общая продуктовая сущность над уже существующими runtime/spec-наработками. Этот dispatcher управляет направлением, а не объявляет capability впервые.

### Минимальный контракт Workbench

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

### Контракт инструментов верстака

Контракт инструмента (эскиз):

- `id`, `title`, `icon?`
- `isApplicable(context) -> boolean`
- `render(context)` (UI)
- `actions[]` (операции)
- `serializeState()` / `hydrateState()` (опционально)

### Image Inspector как встроенное направление

Image inspector остаётся частным набором инструментов внутри общей workbench-линии:

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

### Layout/Space как встроенное направление

Layout/space workbench остаётся частным продуктовым срезом внутри общей сущности Workbench:

- layout-сценарии используют тот же registry и ту же модель `WorkbenchDefinition/Instance`;
- layout tools подключаются как частный набор инструментов общего workbench-контракта;
- решение о том, является ли layout отдельным шагом workflow или внутренним tool-набором, принимается downstream, но в рамках одного dispatcher `dispatcher-workbench`;
- для этого dispatcher используется inherited roadmap `focus-domain/roadmaps/workbench-layout-space.md`.

### Входы, выходы и навигация

Workbench должен:

- получать входные артефакты из Task/Workflow;
- производить выходные артефакты и сохранять их обратно в Task;
- удерживать артефакты как first-class сущности с трассируемыми метаданными источника, версии и времени.

MVP-сценарии навигации:

- открыть задачу → открыть верстак текущего шага;
- перейти на другой шаг → переключить верстак с сохранением состояния;
- вернуться назад → восстановить состояние верстака.

## Risks

- Уже существующие active specs по `workbench` и `workflow` могут разойтись с формулировками dispatcher, если зонтичная роль change не будет явно удерживаться.
- Layout/space и image inspector могут снова начать развиваться как отдельные линии, если downstream changes не будут жёстко привязаны к этому dispatcher.
- Слишком широкий контракт инструментов на раннем этапе может сделать дальнейшие implement changes расплывчатыми и плохо проверяемыми.

## Trade-offs

- Выбран управленческий dispatcher вместо немедленной runtime-реализации, чтобы сначала стабилизировать продуктовую рамку.
- Контракт оставлен минимальным и эскизным, чтобы не зацементировать преждевременно детали UI и storage.
- Частные направления layout/space и image inspector сознательно включены в одну линию, даже если это снижает локальную автономию этих тем.

## Open Questions

- Должен ли downstream runtime трактовать layout как отдельный workflow step или как внутренний tool-набор существующего workbench.
- Нужен ли отдельный capability-слой для `workbench-tools` в active specs, или достаточно удерживать его как часть `workbench`.
- Какой минимальный набор image tools и layout tools должен считаться обязательным для первого проверяемого downstream implement change.

## Тестирование (план)

- Unit/contract: выбор верстака по задаче/шагу, сериализация состояния, применимость инструментов.
- Component/browser: базовые интеракции верстака и 1–2 инструментов, включая layout и image-inspector tools.
- E2E smoke: создать задачу → открыть верстак → выполнить действие → артефакт сохранился.

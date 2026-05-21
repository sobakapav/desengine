# MVP event envelope line

Этот документ описывает канонический MVP текущей event-линии. Он нужен разработчику, который:

- хочет создать или валидировать `EventEnvelope`;
- хочет записать product event через общий runtime-boundary;
- хочет понять, где уже работает наблюдаемая propagation-механика в UI;
- хочет увидеть, что в этом MVP сознательно не реализовано.

## Канонические точки входа

Для работы с MVP event-линии используй три документа:

- [README.md](../README.md): короткий вход и ссылки на профильные документы.
- [docs/event-envelope-mvp.md](./event-envelope-mvp.md): основной инженерный документ по foundation и runtime-flow.
- [docs/testing-layer.md](./testing-layer.md): команды проверки и traceability-ожидания.

## Foundation-слой

Foundation живёт в `lib/system/events/` и задаёт единый контракт события.

Основные точки входа:

- `lib/system/events/contract.ts`: типы `EventEnvelope`, `EventScope`, payload families и helper'ы для MVP scope-матрицы.
- `lib/system/events/source-contract.ts`: source-contract, валидация, `assertEventEnvelope`, `validateEventEnvelope`, `isEventEnvelope`.
- `lib/system/events/fixtures.ts`: foundation fixtures для `experience`, `action` и `cost`.
- `lib/system/events/index.ts`: единый import surface для runtime.

### Обязательные поля `EventEnvelope`

Каждое событие MVP должно содержать:

- `eventId`
- `kind`
- `occurredAt`
- `scope`
- `privacyClass`
- `redactionState`
- `payload`

Payload family сейчас ограничена тремя значениями:

- `experience`
- `action`
- `cost`

`kind` обязан начинаться с того же family-префикса, что и `payload.family`.

### MVP scope-матрица

Foundation принимает только четыре допустимые комбинации `scope`:

- `project`: только `projectId`
- `task`: `projectId` + `taskId`
- `workflow-step`: `projectId` + `taskId` + `workflowStepId`
- `workbench-instance`: `projectId` + `workbenchInstanceId`

Смешанные или расширенные scope-комбинации в MVP не поддерживаются и отклоняются source-contract.

## Runtime-boundary записи события

Единый runtime entrypoint живёт в `lib/project/event-log.ts`.

Публичный контракт MVP:

- `recordEvent(envelope, options?)`

Что делает boundary:

- принимает только валидный `EventEnvelope`;
- прогоняет input через общий `assertEventEnvelope`;
- передаёт валидированное событие в один sink adapter;
- по умолчанию использует `noopProjectEventLogSink`.

Что boundary сознательно не делает:

- не хранит события в persistent storage;
- не поднимает analytics, cost или experience producers;
- не добавляет второй entrypoint записи;
- не размножает локальные validator'ы вне foundation-слоя.

## Наблюдаемый MVP-flow

Первый observable runtime-flow ограничен одной цепочкой:

`app/lab/[taskId]/[screen]/page.tsx` → `LabScreen` → `TaskScreenSection` → `Workbench` → `CodeList`

Это единственный flow, где event envelope уже участвует не только как foundation-контракт, но и как наблюдаемое runtime-поведение.

### 1. `page.tsx` собирает screen event input

Файл `app/lab/[taskId]/[screen]/page.tsx` создаёт начальный `LabTaskScreenEventInput` через `createLabTaskScreenEventInput(taskId, screen)` и передаёт его вниз как `initTaskScreenEventInput`.

На этом шаге ещё нет полноценного envelope: page собирает нормализованный input для screen-level контракта.

### 2. `LabScreen` строит и синхронизирует envelope

Файл `components/desengine/lab/LabScreen/LabScreen.tsx`:

- синхронизирует текущий `LabTaskScreenEventInput`;
- строит `LabTaskScreenEvent` через `buildLabTaskScreenEvent`;
- держит один source of truth для screen-level события;
- передаёт `screenEvent` и `onScreenEventChange` в `TaskScreenSection`.

Helper'ы и типы для этого flow живут в `components/desengine/lab/LabScreen/screen-event.ts`.

### 3. `TaskScreenSection` и `Workbench` не создают новый shape

`components/desengine/lab/LabScreen/ScreenSections.tsx` и `components/desengine/lab/Workbench/props.ts` продолжают передавать тот же контракт:

- `screenEvent`
- `onScreenEventChange`

На этом шаге MVP специально запрещает ad-hoc event shape для того же screen-flow.

### 4. `CodeList` становится первым реальным consumer

Первый наблюдаемый consumer живёт в `components/desengine/lab/Code/Code.tsx`.

`CodeList`:

- читает активный экран через `readLabTaskScreenEventActiveScreen(screenEvent)`;
- получает `eventId` из общего envelope;
- меняет `activeScreen` через `onScreenEventChange(changeLabTaskScreenEventInput(...))`.

Наблюдаемый update path в MVP ровно один: смена `activeScreen`.

## Важное текущее решение MVP

Есть одно осознанное расхождение между широкой исследовательской рамкой и уже реализованным runtime-flow.

Research-линия задаёт общий product event layer с project-scoped мышлением. Но текущий task/workbench flow реально знает только `taskId`, `levelNumber` и `activeScreen`. Поэтому `buildLabTaskScreenEvent` сейчас синтезирует `projectId` в виде `task-<taskId>` и использует `workflow-step` scope для screen-level события.

Для текущего MVP это считается допустимым решением в пользу уже работающего flow:

- оно не нарушает foundation scope-матрицу;
- оно даёт наблюдаемую propagation-механику уже сейчас;
- оно не обещает, что project boundary в lab flow уже окончательно спроектирована.

Если позже в lab runtime появится отдельный project context, этот кусок можно будет нормализовать без переписывания общего `EventEnvelope`.

## Deferred

В MVP сознательно не входят:

- storage любого уровня: in-memory, file-backed, database, export/delete pipeline;
- analytics/cost/experience producers поверх `recordEvent`;
- автоматическая запись screen-flow в runtime sink;
- propagation за пределы цепочки `page.tsx` → `LabScreen` → `TaskScreenSection` → `Workbench` → `CodeList`;
- дополнительные consumer'ы вне `CodeList`;
- расширение scope-матрицы и `schemaVersion`;
- correlation/causation metadata;
- пользовательские help-страницы внутри UI.

## Что проверять внешне

Документация опирается на уже существующие unit/traceability-проверки.

Минимальный внешний контур проверки:

```bash
npm run test:unit
npm run test:traceability
```

Ключевые тестовые файлы для этого MVP:

- `test/unit/event-envelope-contract.test.ts`
- `test/unit/project-event-log-runtime-boundary.test.ts`
- `test/unit/lab-screen-event-propagation.test.ts`

Связанные OpenSpec capability/scenarios:

- `event-envelope`: общий foundation-контракт события и payload families.
- `projects`: единая runtime-boundary записи product event.
- `level-labs`: первый task/workbench flow с наблюдаемым обновлением screen-level события.
- `testing-layer`: traceability metadata и обязательные команды проверки.

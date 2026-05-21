## Why

Foundation-слой `EventEnvelope` сам по себе полезен архитектурно, но не даёт наблюдаемого runtime-эффекта. Для первого MVP этого недостаточно.

Нужен минимальный пользовательски наблюдаемый шаг: как только `page.tsx` собирает event input и передаёт его в `Screen`, дочерние участники screen-контракта получают текущее событие и обновляются вместе с ним. Именно это делает event-линию ощутимой, а не только инфраструктурной.

## What Changes

- Вводится один конкретный MVP runtime-flow screen event propagation для `lab task screen`:
  - [app/lab/[taskId]/[screen]/page.tsx](/Users/op/dev/sobakapav/desengine/app/lab/[taskId]/[screen]/page.tsx) собирает или нормализует один screen-level event input;
  - [components/desengine/lab/LabScreen/LabScreen.tsx](/Users/op/dev/sobakapav/desengine/components/desengine/lab/LabScreen/LabScreen.tsx) получает этот event как входной контракт;
  - [components/desengine/lab/LabScreen/ScreenSections.tsx](/Users/op/dev/sobakapav/desengine/components/desengine/lab/LabScreen/ScreenSections.tsx) передаёт текущее событие и update-канал в task screen;
  - [components/desengine/lab/Workbench/props.ts](/Users/op/dev/sobakapav/desengine/components/desengine/lab/Workbench/props.ts) становится частью явного контракта распространения события к дочерним участникам workbench;
  - изменение `activeScreen` приводит к наблюдаемому обновлению для потомков, подключённых к этому контракту.
- Propagation строится поверх общего `EventEnvelope` или его screen-safe представления, а не поверх ad-hoc локального shape.
- Реализация ограничивается именно task/workbench flow и не расширяется на `check`, `done`, `transition` и другие screen-state ветки.

## Non-goals

- Не подключаем полноценный product event log и storage.
- Не распространяем event propagation на все страницы и все экраны проекта.
- Не вводим глобальную event bus-модель или общий state manager для всего приложения.
- Не делаем массовый producer wiring для `experience`, `action` и `cost`.

## Capabilities

### Modified Capabilities

- `event-envelope`: общий контракт получает наблюдаемое screen-level runtime-потребление.
- `level-labs`: page-to-screen event contract становится явной частью MVP-поведения.
- `testing-layer`: появляется проверяемый runtime-сценарий распространения события внутри экрана.

## Acceptance Criteria

- Есть ровно один MVP-flow: `app/lab/[taskId]/[screen]/page.tsx` → `LabScreen` → `TaskScreenSection` → `Workbench`.
- `page.tsx` для lab task screen собирает screen event и передаёт его в `LabScreen`.
- `LabScreen` и `TaskScreenSection` не размножают ad-hoc event shape, а держат один screen-level контракт.
- `Workbench` получает текущее событие и update-канал минимум для одного реального child consumer'а.
- При изменении `activeScreen` child consumer получает обновлённое событие через тот же контракт, без локального дублирования event shape.
- Используется общий `EventEnvelope` или его явно зафиксированное screen-level представление.
- Есть component/browser или integration/service проверка наблюдаемого обновления события в пределах MVP-screen flow.

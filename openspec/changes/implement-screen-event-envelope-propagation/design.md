## Context

Этот change вводит первый наблюдаемый runtime-эффект event-линии. Его задача не в логировании и не в storage, а в том, чтобы общий event contract начал жить внутри одного реального screen flow.

## Decisions

1. MVP ограничивается одним screen-level сценарием: `lab task screen`.

   Конкретная цепочка первого захода:
   - `app/lab/[taskId]/[screen]/page.tsx`
   - `LabScreen`
   - `TaskScreenSection`
   - `Workbench`

2. Источник события находится в `page.tsx`:
   - page-level слой собирает или нормализует входной event;
   - `Screen` получает один текущий event contract;
   - дочерние участники получают event и update-канал через явный runtime contract.

   Для MVP наблюдаемым триггером обновления считается смена `activeScreen` внутри task/workbench flow.

3. Для MVP допустим либо prop-driven contract, либо локальный screen-scoped provider, но контракт должен оставаться прозрачным:
   - текущий event должен быть наблюдаем у потомков;
   - обновление должно возвращаться в один screen-level source of truth;
   - ad-hoc локальные event shape запрещены.

4. Change не зависит от storage и не обязан вызывать `recordEvent` в production runtime.
   Наблюдаемая польза здесь именно в распространении и обновлении события внутри экрана.

## MVP Scope

В рамках первого захода change должен дать:

- один page-to-screen event contract для `lab task screen`;
- минимум одного дочернего consumer'а внутри `Workbench`, который наблюдает event update;
- один update path на смене `activeScreen`, который меняет event и отражается в потомках;
- component/browser или integration/service проверку этого поведения;
- документационный follow-up под `dispatcher-doc`.

## Deferred

Откладывается:

- propagation для `check`, `done`, `transition`, `level` и любых других экранов;
- связь propagation с persistent log-system;
- cross-screen или app-wide event distribution;
- несколько event families в одном screen flow;
- сложные политики merge/sync между несколькими источниками события.

## Risks / Trade-offs

- [Риск] MVP превратится в скрытый глобальный state manager.
  → Mitigation: ограничить область одним screen flow и одним source of truth.

- [Риск] Контракт расползётся в ad-hoc props по дереву.
  → Mitigation: зафиксировать один screen-level contract и не дублировать event shape локально.

- [Риск] Наблюдаемая польза будет слишком локальной и случайной.
  → Mitigation: выбрать flow, где изменение события видно минимум одному реальному потомку и проверяется тестом.

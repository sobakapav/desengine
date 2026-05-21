## Исследовательская цель

Нужно определить минимальный, но устойчивый `EventEnvelope`, который:

- одинаково подходит для `experience`, `action` и `cost` событий;
- задаёт единые правила scope/privacy/redaction/export/delete;
- не заставляет разные подсистемы дублировать собственные event-контракты;
- остаётся local-first и user-owned на MVP.

## Черновик ядра envelope

Кандидат на общий каркас:

```ts
type EventEnvelope<TPayload> = {
  eventId: string
  kind: string
  projectId: string
  taskId?: string
  workflowStepId?: string
  workbenchInstanceId?: string
  createdAt: string
  privacyClass: "local" | "sensitive" | "secret-adjacent"
  redactionState: "raw" | "redacted" | "metadata-only"
  payload: TPayload
}
```

Этот каркас пока не считается финальным контрактом. Исследование должно подтвердить, достаточно ли его для downstream changes, или нужно добавить, например, `schemaVersion`, `source`, `sessionId`, `retentionClass`.

## Исследовательские блоки

### 1. Граница общего ядра

Нужно определить:

- какие поля обязательны для любого события;
- какие поля допустимы только как опциональные scope-расширения;
- какие поля нельзя поднимать в envelope и нужно оставлять в payload.

### 2. Матрица scope

Нужно описать допустимые формы события:

- project-only;
- project + task;
- project + task + workflow step;
- workbench-local внутри project scope.

Для каждой формы нужно зафиксировать инварианты: когда `taskId` обязателен, когда `workflowStepId` валиден, как соотносится `workbenchInstanceId` с project/task контекстом.

### 3. Payload-профили

MVP-кандидаты:

- `experience.prompt-used`
- `experience.patch-applied`
- `action.hotkey-used`
- `action.tool-opened`
- `cost.llm-usage`
- `cost.manual-time`

Для каждого профиля нужно определить:

- какие данные являются metadata;
- какие данные являются content-bearing;
- какие поля запрещены по умолчанию;
- требуется ли raw-хранение вообще.

### 4. Privacy и redaction

Нужно определить:

- кто и когда назначает `privacyClass`;
- какие payload-поля требуют обязательной redaction;
- что именно означает `metadata-only` для разных профилей;
- какие события запрещено хранить в `raw` даже локально.

Базовые guardrails для MVP:

- local-first storage;
- no cloud by default;
- metadata-only по умолчанию для `cost`, где content не нужен;
- явная redaction для prompt/code payloads;
- export/delete должны работать минимум по `projectId`.

### 5. Lifecycle и adapter boundary

Нужно ответить:

- является ли envelope единицей retention/export/delete;
- как выглядит boundary будущего `recordEvent`;
- где проходит валидация envelope;
- нужен ли отдельный storage shape для redacted/export view.

### 6. Результаты исследования

На выходе должны появиться:

- таблица полей envelope с обязательностью и обоснованием;
- матрица scope-инвариантов;
- матрица privacy/redaction/export/delete правил;
- каталог MVP payload-профилей;
- список downstream behavior-change changes.

## Dispatcher follow-up

Первый operational-этап после этого producer change оформляется отдельными dispatcher changes:

- `dispatcher-event-envelope` для управления общим контрактом события;
- `dispatcher-log-system` для управления системой журналирования продуктовых событий.

## Тестовый след исследования

Этот change не добавляет runtime-тесты. Он должен зафиксировать, какие проверки станут обязательными для реализации:

- static/contract: инварианты envelope и payload profiles;
- unit: privacy/redaction logic;
- traceability: связь сценариев `event-envelope`, `experience`, `cost-accounting` с тестами;
- при появлении пользовательского flow в downstream change: минимум один integration/browser smoke.

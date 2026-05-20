## Модель данных (MVP)

### CostEvent

- `id`
- `createdAt`
- `projectId?`
- `taskId?`
- `source` (llm / user / system)
- `type`:
  - `llm_tokens` (input/output/total)
  - `manual_time` (seconds/minutes)
  - `expertise_usage` (skill/attractor used)
- `unit` (tokens / seconds / count / currency?)
- `quantity`
- `metadata` (model id, skill id, tags, etc.)

Важно: в MVP **не** сохраняем содержимое промптов/ответов в этом слое — только метрики и безопасные метаданные.

### CostAggregate

Агрегаты считаются по:

- `scope`: project | task
- `scopeId`
- `period`: day/week/month (минимум day)
- суммы по категориям: tokens, manual time, expertise usage count
- (опционально) расчёт денег:
  - либо через фиксированные rate settings,
  - либо через «пока неизвестно» с хранением токенов как первичной величины.

## Процесс фонового учёта

Источники событий:

- LLM usage: автоматически из runtime-данных вызовов модели (input/output tokens).
- Manual time: вручную (минимум: старт/стоп таймера на задаче или ввод значения).
- Expertise usage: событие применения skill/аттрактора/шаблона (когда есть такая инфраструктура).

Агрегация:

- инкрементальная (при поступлении события) или пакетная (по таймеру) — выбрать MVP-стратегию.

## Настройки

MVP настройки:

- включить/выключить учёт;
- rates (опционально): цена токена/час специалиста (может быть unset).

## Тестирование (план)

- Unit: валидация событий, агрегация, корректность сумм, стабильность периодов.
- Traceability: сценарии cost-accounting ↔ тесты.
- Integration (позже): проверка, что LLM usage события действительно пишутся из реального pipeline.


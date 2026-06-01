## Context

`iteration` и `llm` уже фиксируют, что image-bearing task flow должен передавать картинки уровня в provider. `DeepSeek` сейчас выбивается из этого контура: адаптер принимает `imageBase64List`, но не использует их в HTTP payload.

Это опаснее обычной provider-ошибки: пользователь не видит явного отказа, но получает деградированный ответ, который не соответствует input-контексту.

## Goals

- Убрать silent degradation для image-dependent DeepSeek flow.
- Зафиксировать один явный runtime contract: либо vision реально поддержан, либо task action не стартует.
- Сделать проблему видимой тестам и системной диагностике.

## Non-goals

- Не ослаблять contract `iteration` ради DeepSeek.
- Не добавлять новый продуктовый режим “работать без картинок”.

## Decisions

1. Image-bearing запрос не должен silently превращаться в text-only.
   - Если images есть, runtime обязан считать их обязательной частью запроса.

2. DeepSeek-поведение должно быть бинарным.
   - `supported`: adapter реально отправляет изображения.
   - `unsupported`: task runtime и `/system` заранее сообщают, что текущая DeepSeek-конфигурация не подходит для vision-based task flow.

3. Проверка должна жить в provider boundary, а не в UI.
   - UI показывает понятную ошибку, но root cause guardrail должен находиться в LLM/runtime слое.

## Risks / Trade-offs

- [Риск] Поддержка vision у DeepSeek зависит от конкретной модели или endpoint.
  → Mitigation: зафиксировать capability gate явно, а не предполагать поддержку по имени провайдера.

- [Риск] Быстрый “запретить DeepSeek” сломает существующие non-image вызовы.
  → Mitigation: блокировать только image-bearing task flow, а не весь provider-глобал.

## Open Questions

- Нужен ли отдельный config flag/capability для vision support, или достаточно вывести его из provider/model boundary.

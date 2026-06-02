## Context

`dispatcher-runtime` уже держит lab action service boundaries. Внутри этих boundaries `start`, `iterate` и `check` строят дорогостоящий путь:

- чтение prompt-слоя и task context;
- включение картинок и file contexts;
- structured LLM request;
- parsing output;
- запись файлов и мутация состояния задачи.

Сейчас у этого пути есть timeout'ы, но timeout не заменяет budget. Запрос может быть слишком большим, ответ может быть чрезмерным, а write-set может быть дороже, чем стоит разрешать для user-facing локальной системы.

## Goals

- Ввести bounded contract для expensive LLM input/output path.
- Защитить CPU/RAM/disk от чрезмерного payload и write-set даже при формально «успешном» provider-ответе.
- Сохранить понятный retriable contract без частичного применения oversized-результата.

## Non-goals

- Не менять сами тексты prompt'ов как продуктовую стратегию.
- Не менять provider selection и install-critical конфигурацию.
- Не переписывать все task actions за пределами bounded validation path.

## Decisions

1. Budget должен проверяться до дорогих побочных эффектов.
   - Чем раньше oversized path отклоняется, тем меньше нагрузка на машину пользователя.

2. Budget нужен и для input, и для output.
   - Ограничить только prompt или только response недостаточно.

3. Write-set budget является частью runtime safety.
   - Даже корректный structured-output не должен безусловно попадать на диск, если он слишком велик для локального user-facing action.

## Risks / Trade-offs

- Слишком жёсткие budget'ы могут резать полезные сценарии сложных компонентов.
- Слишком мягкие budget'ы не дадут реальной machine-level защиты.
- Появится ещё один класс явных ошибок, который нужно аккуратно отличить от provider/network/timeout.

## Open Questions

- Какие budgets лучше считать в символах, а какие в байтах/числе файлов/числе картинок.
- Нужно ли отдельно различать budget для `init` и budget для `iterate/check`.

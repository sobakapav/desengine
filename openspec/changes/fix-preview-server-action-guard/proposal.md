## Why

Сейчас Sandpack preview может принять пользовательский компонент с Next.js Server Actions как обычный React runtime. В результате внутри iframe появляется каскад ошибок вида `Failed to find Server Action "x"`, хотя для пользователя проблема не в deployment mismatch, а в том, что preview вообще не поддерживает этот API.

Такой сбой шумный и плохо объясняет, что именно нужно исправить в коде задачи.

## What Changes

- preview-builder заранее распознаёт неподдерживаемые маркеры Next.js Server Actions в preview-файлах;
- вместо запуска проблемного runtime-path builder возвращает безопасный fallback-компонент;
- structured diagnostics помечают эту ветку отдельной причиной `unsupported_preview_api`;
- host UI показывает человеку понятную диагностику, а не только внутренний Next error overlay.

## Non-goals

- Не добавлять поддержку Server Actions в Sandpack preview.
- Не менять install-critical стек, Next.js или Turbopack.
- Не переписывать общий preview runtime-contract.

## Capabilities

### Modified Capabilities

- `task`: preview получает явный guardrail против Next.js Server Actions.
- `level-labs`: structured preview diagnostics различают unsupported preview API и budget/runtime ветки.
- `testing-layer`: unit-слой фиксирует этот fallback как runnable contract.

## Acceptance Criteria

- компонент с Server Actions больше не уводит preview в каскад `Failed to find Server Action`;
- пользователь видит безопасный fallback и понятный текст, что preview не поддерживает Server Actions;
- runtime diagnostics возвращают degraded-ветку с причиной `unsupported_preview_api`;
- change описывает runnable unit/traceability-покрытие.

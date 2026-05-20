## Why

Диспетчер требует cost-guardrails: обязательный quality-gate должен оставаться детерминированным, а optional LLM-режим не должен случайно попадать в `test:full` или раздувать стоимость больших PR.

## What Changes

- Зафиксировать `llm.mode = off` по умолчанию в `tools/quality-text/config.json`.
- Добавить явное чтение `QUALITY_TEXT_LLM_MODE` только как optional override.
- Добавить budget caps по числу файлов и токенов.
- При превышении бюджета или ошибке возвращаться к deterministic fallback.
- Добавить метрики отчёта: `scope`, `filesChecked`, `violations`, `waivedViolations`, `llmMode`.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: static/contract + unit.
- Команды проверки: `npm run test:unit`, `npm run quality:text`, `npm run test:full`.
- Mock/credentials: live credentials не нужны; optional LLM не выполняет сетевой вызов в этом change.

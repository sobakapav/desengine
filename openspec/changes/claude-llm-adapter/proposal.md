## Why

В системе уже есть отдельные адаптеры OpenAI, DeepSeek и Google Gemini. Claude нужен как ещё один внешний LLM-провайдер по ключу, чтобы оператор мог переключить лабораторию без изменений в коде и без смешивания протокола Anthropic с существующими адаптерами.

## What Changes

- Добавляем отдельный адаптер Claude поверх общего LLM-слоя.
- Фиксируем конфигурацию `CLAUDE_API_KEY`, `CLAUDE_MODEL`, `CLAUDE_BASE_URL` и `CLAUDE_MAX_TOKENS` в `desengine.config.txt` и шаблоне.
- Добавляем инструкцию по настройке Claude.
- Фиксируем понятные ошибки конфигурации, авторизации, сети и невалидного ответа Claude.
- Добавляем unit-покрытие и traceability для новых сценариев.

## Capabilities

### New Capabilities
- `claude`: подключение и конфигурация адаптера Claude.

### Modified Capabilities
- `llm`: система поддерживает выбор Claude как отдельного сетевого провайдера наряду с OpenAI, DeepSeek и Google Gemini.

## Impact

- Конфигурация: появляется новый режим `LLM_PROVIDER=claude` и provider-specific переменные Claude.
- API/инфраструктура: общий LLM registry получает новый адаптер для Anthropic Messages API.
- Документация: добавляется `docs/claude.md`, обновляются root/install/testing документы.
- Тесты: обновляется unit-покрытие LLM-адаптеров и traceability-карта.

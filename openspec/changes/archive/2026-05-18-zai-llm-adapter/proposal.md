## Why

После OpenAI, DeepSeek, Google Gemini и Claude системе нужен отдельный адаптер Z.AI, чтобы оператор мог использовать GLM-модели напрямую через платформу Z.AI. По официальной документации Z.AI предоставляет собственный API endpoint, ключи и модельный ряд `glm-*`, то есть это самостоятельная LLM-платформа, а не прослойка к другому провайдеру.

## What Changes

- Добавляем отдельный адаптер Z.AI поверх общего LLM-слоя.
- Фиксируем конфигурацию `ZAI_API_KEY`, `ZAI_MODEL` и `ZAI_BASE_URL` в `desengine.config.txt` и шаблоне.
- Добавляем инструкцию по настройке Z.AI и предупреждение про выбор visual-модели для задач с изображениями.
- Фиксируем понятные ошибки конфигурации, авторизации, сети и невалидного ответа Z.AI.
- Добавляем unit-покрытие и traceability для новых сценариев.

## Capabilities

### New Capabilities
- `zai`: подключение и конфигурация адаптера Z.AI.

### Modified Capabilities
- `llm`: система поддерживает выбор Z.AI как отдельного сетевого провайдера наряду с OpenAI, DeepSeek, Google Gemini и Claude.

## Impact

- Конфигурация: появляется новый режим `LLM_PROVIDER=zai` и provider-specific переменные Z.AI.
- API/инфраструктура: общий LLM registry получает новый адаптер для Z.AI Chat Completions API.
- Документация: добавляется `docs/zai.md`, обновляются root/install/testing документы.
- Тесты: обновляется unit-покрытие LLM-адаптеров и traceability-карта.

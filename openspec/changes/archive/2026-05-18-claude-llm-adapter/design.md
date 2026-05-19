## Контекст

Текущий LLM-слой выбирает активный адаптер через `LLM_PROVIDER` и registry в `lib/llm/server.ts`. OpenAI и Gemini принимают изображения уровня, DeepSeek работает text-only. Все провайдеры возвращают общий `LlmStructuredResponse`, а статус конфигурации строится через единый `getLlmStatus()`.

## Решение

- Добавить `claude` в `LlmProvider` и `ADAPTERS`.
- Для Claude использовать env-настройки:
  - `CLAUDE_API_KEY`;
  - `CLAUDE_MODEL`;
  - `CLAUDE_BASE_URL`;
  - `CLAUDE_MAX_TOKENS`.
- Использовать endpoint `<CLAUDE_BASE_URL>/messages`.
- Передавать ключ через `x-api-key`, версию API через `anthropic-version`, тело запроса через Messages API.
- Передавать изображения уровня как content-блоки `image` с `source.type=base64` и `media_type=image/png`.
- Передавать JSON-schema запроса через structured output format провайдера и сохранять системное требование вернуть только JSON.
- Маппить `usage.input_tokens` и `usage.output_tokens` в общие LLM-метрики, включая cache input tokens при наличии.
- Сохранять общий error mapping: config -> 400, timeout -> 504, auth/network/invalid_response -> 502, provider -> 500.

## Проверка

- OpenSpec capability/scenarios:
  - `claude`: все новые сценарии адаптера;
  - `llm`: выбор Claude, общий выбор сетевого провайдера, конфиги нескольких провайдеров, ошибка Claude.
- Уровень проверки:
  - unit для запроса Claude, статуса, auth-ошибки и обязательного `CLAUDE_MAX_TOKENS`;
  - static/contract через `npm run test:traceability`.
- Команды:
  - `npm run test:unit -- test/unit/llm.server.test.ts`;
  - `npm run test:traceability`.
- Mock-данные:
  - unit-тесты используют stub `fetch` и synthetic Claude JSON-response/error;
  - live credentials не требуются.

## Не входит

- Live/provider smoke против реального Anthropic API.
- UI-изменения вне уже существующего универсального LLM status.

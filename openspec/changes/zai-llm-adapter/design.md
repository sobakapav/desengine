## Контекст

Z.AI публикует собственный general endpoint `https://api.z.ai/api/paas/v4`, использует Bearer API key и Chat Completions endpoint `/chat/completions`. Формат ответа совместим с OpenAI-style `choices[].message.content` и `usage.prompt_tokens/completion_tokens/total_tokens`. Для visual-моделей Z.AI принимает content-блоки `image_url`.

## Решение

- Добавить `zai` в `LlmProvider` и `ADAPTERS`.
- Для Z.AI использовать env-настройки:
  - `ZAI_API_KEY`;
  - `ZAI_MODEL`;
  - `ZAI_BASE_URL`.
- Использовать endpoint `<ZAI_BASE_URL>/chat/completions`.
- Передавать ключ через `Authorization: Bearer`.
- Передавать изображения уровня как OpenAI-compatible content-блоки `image_url` с PNG data URL.
- Передавать JSON-режим через `response_format: { type: "json_object" }` и сохранять системное требование вернуть только JSON.
- Маппить `usage.prompt_tokens`, `usage.completion_tokens` и `usage.total_tokens` в общие LLM-метрики.
- Сохранять общий error mapping: config -> 400, timeout -> 504, auth/network/invalid_response -> 502, provider -> 500.

## Проверка

- OpenSpec capability/scenarios:
  - `zai`: все новые сценарии адаптера;
  - `llm`: выбор Z.AI, общий выбор сетевого провайдера, конфиги нескольких провайдеров, ошибка Z.AI.
- Уровень проверки:
  - unit для запроса Z.AI, статуса, auth-ошибки и обязательного `ZAI_BASE_URL`;
  - static/contract через `npm run test:traceability`.
- Команды:
  - `npm run test:unit -- test/unit/llm.server.test.ts`;
  - `npm run test:traceability`.
- Mock-данные:
  - unit-тесты используют stub `fetch` и synthetic Z.AI JSON-response/error;
  - live credentials не требуются.

## Не входит

- Live/provider smoke против реального Z.AI API.
- Автоматический выбор visual-модели, если пользователь включил Z.AI и задача содержит изображения.

# Z.AI API — локальная настройка

## Аудитория

- Администратор локальной установки.
- Инженер сопровождения, который настраивает активного LLM-провайдера.

Z.AI — самостоятельная LLM-платформа для GLM-моделей. Это не прокси к OpenAI или Anthropic: у платформы есть собственный endpoint, ключи и модельный ряд `glm-*`. При этом API совместим с OpenAI Chat Completions, поэтому адаптер использует общий chat-completions формат.

Эта лаборатория использует общий LLM-слой. Z.AI можно держать рядом с OpenAI, DeepSeek, Google Gemini и Claude в одном `desengine.config.txt`, а активный провайдер выбирается через `LLM_PROVIDER`.

Эта настройка относится к админскому контуру. Пользователь без ключа активного провайдера всё равно сможет открыть страницу состояния в браузере, но рабочие LLM-сценарии останутся недоступны.

## Обязательное

- `ZAI_API_KEY` — ключ Z.AI API из Z.AI Open Platform.
- `ZAI_MODEL` — модель Z.AI для всей лаборатории.
- `ZAI_BASE_URL` — базовый URL Z.AI API.

## Как задать

Переименуй [desengine.config-example.txt](../desengine.config-example.txt) в `desengine.config.txt` и укажи в нём Z.AI как активный провайдер:

```env
LLM_PROVIDER=zai
ZAI_API_KEY=...
ZAI_MODEL=glm-5v-turbo
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
```

Если OpenAI-, DeepSeek-, Gemini- и Claude-конфиги тоже лежат рядом, они не конфликтуют с Z.AI, пока активным остаётся `LLM_PROVIDER=zai`.

Текущая версия адаптера Z.AI использует Chat Completions endpoint `/chat/completions`, `Authorization: Bearer`, `response_format=json_object` и non-streaming режим. Изображения уровня передаются как OpenAI-compatible `image_url` content-блоки. Для задач с изображениями выбирайте Z.AI-модель с visual-входом, например `glm-5v-turbo`; текстовые модели могут не принять картинки.

Для доступа по email см. [access-control.md](./access-control.md).
Админские команды сопровождения и smoke-check собраны в [tools/README.md](../tools/README.md).

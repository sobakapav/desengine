# DeepSeek API — локальная настройка

## Аудитория

- Администратор локальной установки.
- Инженер сопровождения, который настраивает активного LLM-провайдера.

Эта лаборатория использует общий LLM-слой. DeepSeek можно держать рядом с OpenAI в одном `desengine.config.txt`, а активный провайдер выбирается через `LLM_PROVIDER`.

Эта настройка относится к админскому контуру. Пользователь без ключа активного провайдера всё равно сможет открыть страницу состояния в браузере, но рабочие LLM-сценарии останутся недоступны.

## Обязательное

- `DEEPSEEK_API_KEY` — ключ DeepSeek API.
- `DEEPSEEK_MODEL` — модель DeepSeek для всей лаборатории.
- `DEEPSEEK_BASE_URL` — базовый URL DeepSeek API.

## Как задать

Переименуй [desengine.config-example.txt](../desengine.config-example.txt) в `desengine.config.txt` и укажи в нём DeepSeek как активный провайдер:

```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

Если OpenAI-конфиг тоже лежит рядом, он не конфликтует с DeepSeek, пока активным остаётся `LLM_PROVIDER=deepseek`.

## Текущее ограничение

Text-only запросы допустимы только для сценариев без изображений.

Если сценарий лаборатории зависит от картинок уровня, запросы через DeepSeek завершаются ранней ошибкой до сетевого вызова. В текущем endpoint DeepSeek не поддерживает такие запросы с изображениями в контракте этой лаборатории.

Для recovery path оператору нужно либо выбрать провайдера с vision-поддержкой, либо не запускать сценарий, которому нужны изображения.

Для доступа по email см. [access-control.md](./access-control.md).
Админские команды сопровождения и smoke-check собраны в [tools/README.md](../tools/README.md).

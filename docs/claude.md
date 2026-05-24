# Claude API — локальная настройка

## Аудитория

- Администратор локальной установки.
- Инженер сопровождения, который настраивает активного LLM-провайдера.

Эта лаборатория использует общий LLM-слой. Claude можно держать рядом с OpenAI, DeepSeek и Google Gemini в одном `desengine.config.txt`, а активный провайдер выбирается через `LLM_PROVIDER`.

Эта настройка относится к админскому контуру. Пользователь без ключа активного провайдера всё равно сможет открыть страницу состояния в браузере, но рабочие LLM-сценарии останутся недоступны.

## Обязательное

- `CLAUDE_API_KEY` — ключ Claude API из Claude Console.
- `CLAUDE_MODEL` — модель Claude для всей лаборатории.
- `CLAUDE_BASE_URL` — базовый URL Claude API.
- `CLAUDE_MAX_TOKENS` — максимальный размер ответа Claude в токенах.

## Как задать

Переименуй [desengine.config-example.txt](../desengine.config-example.txt) в `desengine.config.txt` и укажи в нём Claude как активный провайдер:

```env
LLM_PROVIDER=claude
CLAUDE_API_KEY=...
CLAUDE_MODEL=claude-haiku-4-5
CLAUDE_BASE_URL=https://api.anthropic.com/v1
CLAUDE_MAX_TOKENS=4096
```

Если OpenAI-, DeepSeek- и Gemini-конфиги тоже лежат рядом, они не конфликтуют с Claude, пока активным остаётся `LLM_PROVIDER=claude`.

Текущая версия адаптера Claude поддерживает те же входы лаборатории, что и другие сетевые адаптеры: текстовый запрос, изображения уровня и structured JSON-ответ. Для изображений используются PNG-данные из LLM-запроса, а для JSON-ответа адаптер передаёт провайдеру схему текущего запроса.

Для доступа по email см. [access-control.md](./access-control.md).
Для onboarding-источника и ручного обновления см. [onboarding.md](./onboarding.md).
Админские команды сопровождения и smoke-check собраны в [tools/README.md](../tools/README.md).

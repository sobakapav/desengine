# Дизайн

## Решение

`check.md` остаётся canonical hidden prompt-файлом проверки уровня, но становится необязательным.

Поведение чтения:

- `onboarding/prompts/levels/<levelId>/check.md` найден: runtime возвращает содержимое файла.
- Файл отсутствует: runtime возвращает пустую строку.
- Остальной checking instruction собирается без изменений: общий production prompt, didactic default, overview уровня, картинки и разрешённые рабочие файлы.

## Не меняем

- `start.md` остаётся обязательным для запуска уровня.
- `iterate.md` остаётся optional, как и раньше.
- `maxCheckAttempts` и логика расходования содержательных проверок не меняются.
- Отдельный validation-step для обязательности `check.md` не добавляется, потому что файл теперь не обязателен.

## Тестовая стратегия

- Capability/scenarios: `llm` — checking prompt lookup; `onboarding-repo` — optional hidden checking prompt.
- Уровень проверки: unit/static source-contract.
- Команда: `npm run test:unit -- --run test/unit/llm-flow-source-contract.test.ts`.
- Mock/fixture/live credentials не нужны: проверяется локальный код чтения prompt-файла без LLM-провайдера.

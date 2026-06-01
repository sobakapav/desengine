## Tasks

- [x] 1. Локализовать provider boundary для image-bearing DeepSeek task-flow.
- [x] 2. Устранить silent-loss изображений:
  - [ ] 2.1 либо отправлять изображения в поддерживаемом формате;
  - [x] 2.2 либо вводить fail-fast guard для image-dependent запросов.
- [x] 3. Согласовать task action и system diagnostics с новым поведением.
- [x] 4. Добавить тесты, которые фиксируют запрет на silent text-only fallback.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `iteration`: пользователь запускает уточняющий промпт; система снова отправляет все картинки текущего уровня.
- `llm`: конфигурация выбрала DeepSeek; DeepSeek вернул ошибку.
- `deepseek`: оператор выбирает DeepSeek.

Уровни проверки:
- unit: обязательный.
- component/browser: желателен follow-up, если будет добавлен видимый UI guardrail.

Команды запуска:
- `npm run test:unit -- test/unit/llm.server.deepseek.test.ts`
- `npm run test:unit -- test/unit/llm-flow-source-contract.test.ts`

Mock/fixture-данные и credentials:
- live credentials не нужны;
- используются unit-mocks HTTP provider response и image-bearing structured request payload.

Статус реализации:
- выбран fail-fast путь: `DeepSeek` в текущем `chat/completions` endpoint больше не деградирует в text-only при наличии `imageBase64List`, а завершает вызов с явной `config`-ошибкой до сетевого запроса;
- unit coverage обновлён в `test/unit/llm.server.deepseek.test.ts`;
- смежный source-contract `test/unit/llm-flow-source-contract.test.ts` сохранён без изменений и используется как регрессионный контроль верхнего уровня.

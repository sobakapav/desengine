## Why

Пользовательский уточняющий запрос должен либо завершиться результатом, либо завершиться понятной ошибкой за разумное время. Сейчас этот инвариант нарушен:

- `lib/llm/runtime.ts` добавляет timeout только для `target: "init"`;
- `iterate` и `check` идут без `AbortSignal`;
- workbench UI держит pending-состояние до завершения fetch, не имея собственного bounded escape path.

Если provider или сеть зависают, пользователь остаётся в “Запуск…” или “Проверка…”, не понимая, ждать дальше или пробовать заново.

## What Changes

- Добавить bounded timeout policy для `iterate` и `check`.
- Превратить timeout в retriable user-facing ошибку того же класса, что и другие LLM runtime failures.
- Гарантировать, что UI выходит из pending и позволяет повторить действие без потери состояния.

## Non-goals

- Не менять смысл `init` timeout.
- Не переписывать composer UX целиком.
- Не решать в этом change multimodal/provider-compatibility вопросы.

## Impact

- Уточняющие запросы и проверка уровня перестанут зависать бесконечно.
- Пользователь получит предсказуемую границу ожидания и понятный recovery path.

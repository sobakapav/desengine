## Why

Сам по себе integration runner не даст пользы, если в нём не появится первый осмысленный набор сценариев. Самые ценные кандидаты уже видны в коде и active specs: task action routes, `GET /api/status/llm` и `POST /api/onboarding/update`. Именно они дают интеграционную склейку route handler -> auth/body/params -> runtime/service boundary без браузера и live credentials.

## What Changes

- Добавить первую wave integration-тестов для task API routes:
  - `GET /api/tasks/[taskId]`
  - `POST /api/tasks/[taskId]/start`
  - `POST /api/tasks/[taskId]/iterate`
  - `POST /api/tasks/[taskId]/check`
  - `POST /api/tasks/[taskId]/reset`
  - при необходимости `POST /api/tasks/[taskId]/files`
- Добавить integration-покрытие для `GET /api/status/llm`.
- Добавить integration-покрытие для `POST /api/onboarding/update`.

## Non-goals

- Не превращать эту wave в browser smoke или live/provider проверку.
- Не включать в wave route handlers, у которых пока неясна contract-traceability граница.
- Не менять пользовательский runtime-контракт этих route handlers.

## Impact

- `test:integration` получает первый реально полезный набор сценариев.
- Критичные server/API contracts больше не зависят только от unit source-checks или браузерного smoke.

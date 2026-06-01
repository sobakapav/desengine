## Why

`test:integration` уже заявлен в тестовом слое, но сейчас это placeholder. Из-за этого у проекта нет отдельного уровня, который проверяет реальную склейку `app/api/**` route handlers с auth/env/runtime boundary, но при этом не требует браузера, `next dev` и live provider credentials.

## What Changes

- Реализовать для `test:integration` отдельный runnable integration runner.
- Добавить общий route/API integration harness для вызова `app/api/**/route.ts` и близких server boundary на mock/fixture-данных.
- Обновить документацию тестового слоя под новый статус `test:integration`.

## Non-goals

- Не включать `test:integration` в обязательный `test:full` на этом шаге.
- Не поднимать браузерный или dev-server слой внутри integration-команды.
- Не выполнять реальные provider, allowlist или onboarding network-вызовы.
- Не закрывать в этом change всю domain-specific integration матрицу; для этого нужна отдельная route-wave.

## Impact

- `npm run test:integration` перестаёт быть декларативным placeholder.
- Команда получает стабильную точку входа для server/API-flow без смешения unit и e2e.

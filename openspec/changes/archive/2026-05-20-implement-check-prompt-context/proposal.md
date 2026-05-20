## Why

Сейчас hidden `check.njk` уровней рендерится через общий template runtime, но получает пустой context. Из-за этого автор prompt не может использовать данные выбранного UI kit проекта, например `{{ user.designSystemName }}`, хотя такой контракт уже фактически есть у `tip.njk`.

## What Changes

- В `check` flow прокидывается project-aware prompt context.
- Hidden `check.njk` получает те же базовые данные `user/project/level/task`, что уже доступны task hints.
- Клиентский вызов проверки передаёт текущий project state на сервер.
- Сервер нормализует project, вычисляет effective UI kit и рендерит `check.njk` с этим context.
- Добавляются unit/traceability проверки на `{{ user.designSystemName }}` и related fallback behavior.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- `llm`: hidden checking prompt уровня получает формализованный render context, включающий выбранный дизайн-системный режим проекта.
- `onboarding-repo`: автор `check.njk` может использовать переменные `user/project/level/task`, доступные в hidden check prompt runtime.

## Impact

- `app/api/tasks/[taskId]/check/route.ts`
- `components/desengine/lab/**`
- `lib/prompt/**`
- `lib/task/actions/check.ts`
- unit/traceability слой и OpenSpec delta по `llm`/`onboarding-repo`

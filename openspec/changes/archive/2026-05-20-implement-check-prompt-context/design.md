## Context

Для task hints уже есть готовый builder контекста в `lib/task/hints.ts`: он знает, как превратить project state в `user.designSystemName`, `project.uiKitTitle` и effective UI kit. Hidden check prompts сейчас этой логикой не пользуются: `readLevelCheckPrompt(levelId)` читает `check.njk` с пустым `{}`.

## Decision

### 1. Передача project state в check route

Клиентский `handleCheck()` должен передавать на сервер текущий `project` из Workbench, так же как hint route уже получает `uiKitId/uiMode/projectId/projectTitle`.

План по файлам:

- `components/desengine/lab/Workbench/useWorkbenchController.ts` — отправлять `project` в body `POST /api/tasks/:taskId/check`;
- `components/desengine/lab/LabScreen/ScreenSections.tsx` — повторная проверка из экрана результата тоже должна передавать тот же project state, если этот путь использует check API;
- `app/api/tasks/[taskId]/check/route.ts` — распарсить body, нормализовать `project`.

### 2. Общий builder prompt context

Логику из `lib/task/hints.ts` не стоит дублировать внутри check flow. Нужен общий helper, который строит `PromptRenderContext` из:

- `taskId`
- `taskConfig`
- `level`
- `project`

Минимальные поля:

- `user.designSystemId`
- `user.designSystemName`
- `task.id`
- `task.maxLevel`
- `task.images`
- `level.id`
- `level.number`
- `level.title`
- `level.labId`
- `level.editableFileIds`
- `project.uiKitId`
- `project.uiKitTitle`
- `project.effectiveUiKitId`
- `project.effectiveUiKitTitle`
- `project.uiMode`

### 3. Prompt API для hidden check prompt

`readLevelCheckPrompt` должен принимать не только `levelId`, но и `PromptRenderContext`, чтобы `check.njk` рендерился не с `{}`, а с реальными данными текущего проекта и уровня.

Изменения:

- `lib/prompt/server.ts` — расширить `readLevelCheckPrompt(...)`;
- `lib/task/actions/check.ts` — собрать context и передать его в prompt reader;
- при отсутствии переданного context fallback должен оставаться безопасным.

### 4. Scope boundary

В этом implement change меняется только `check` path. `start` и `iterate` можно выровнять отдельным child change, если команде потребуется тот же контекст в этих prompt'ах.

## Testing

Обязательные проверки:

- unit: route/action/prompt reader прокидывают project-aware context;
- unit: `check.njk` может использовать `{{ user.designSystemName }}`;
- traceability: новые сценарии связаны с тестами;
- `npm run test:unit`
- `npm run test:traceability`

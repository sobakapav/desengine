## Why

Start/iterate/check уже вынесены в service boundary, но prompt context всё ещё собирается внутри конкретных flows из task, level, images, files и пользовательского текста. Перед `task-hints-templating`, `prompt-builder` и новыми workbench tools нужен единый runtime contract prompt context.

Этот change выделяет PromptContext builder, чтобы prompt-related features не создавали разные модели project/task/workflow/workbench/artifact context.

## What Changes

- Вводится `PromptContext` как canonical input для LLM/runtime prompt flows.
- `startTaskLevel`, `iterateTaskLevel`, `checkTaskLevel` переходят на общий context builder.
- Context включает project, task, workflow step, artifacts, workbench state/tools, user text, constraints и provider capabilities.
- `task-hints-templating` и `prompt-builder` становятся downstream consumers этого boundary.

## Non-goals

- Не реализуем UI prompt builder.
- Не меняем provider selection или LLM SDK.
- Не переписываем prompt тексты ради стилистики.

## Capabilities

### New Capabilities

- `prompt-context`: сбор и сериализация контекста для LLM flows.

### Modified Capabilities

- `llm`: start/iterate/check используют общий PromptContext.
- `iteration`: уточняющие промпты получают стабильный context.
- `task`: task service boundary не собирает context ad-hoc.

## Acceptance Criteria

- Есть типизированный `PromptContext` и builder.
- Start/iterate/check могут использовать общий builder без изменения HTTP/UX contract.
- PromptContext покрыт unit tests с fixtures project/task/workflow/artifacts.
- Старые prompt flows остаются совместимыми.

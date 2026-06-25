## Why

За `/onboarding` отвечает отдельный человек, но сейчас у него нет канонической инструкции, как
перестроить структуру задач под проектный и workflow режимы. Без этого migration onboarding рискует
остаться на старой level-центричной схеме даже после того, как продуктовый путь уже сдвигается в
`проект -> workflow -> проверка/чеклист -> результат`.

## What Changes

- Подготовить практическую инструкцию для контент-менеджера по migration onboarding-задач.
- Зафиксировать mapping старой структуры task/level на новую project/workflow схему.
- Явно описать, какие metadata-поля должны жить в task config, какие в workflow-описании, а какие в project-aware контексте.
- Добавить примеры заполнения metadata и чеклист, по которому можно проверить, что onboarding-задача действительно готова к новому режиму.

## Capabilities

### New Capabilities

- Нет: change создаёт исполнительскую инструкцию и не вводит новый пользовательский контракт сам по себе.

### Modified Capabilities

- Нет: сам change не меняет runtime behavior, а готовит migration guide для последующих onboarding UI/content waves.

## Impact

- Контент-менеджер получает канонический документ для перестройки onboarding-задач.
- Downstream onboarding UI-waves получают опорную схему metadata и структуры шагов.
- `dispatcher-tasks` получает первую обязательную content-wave, без которой UI migration не должна начинаться.

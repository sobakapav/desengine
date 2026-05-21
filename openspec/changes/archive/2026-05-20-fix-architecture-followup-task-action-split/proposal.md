## Why

После `implement-prompt-context-runtime-boundary` файл `lib/task/actions/start.ts` остался выше soft-limit `code-readability` и был временно закрыт waiver `architecture-followup-task-action-split`.

Нужно убрать этот waiver через узкий behavior-preserving refactor: вынести части start-flow в отдельные helper-модули, сохранив HTTP response contract и текущий PromptContext/LMM-flow.

## What Changes

- Разбить `lib/task/actions/start.ts` на компактный orchestration-файл и helper-модули для runtime context, LLM input/stages и file write/complete stages.
- Сохранить публичный экспорт `taskStartAction.startTaskLevel(taskId)` и все текущие response/error contracts.
- Сохранить использование `buildTaskRuntimePromptContext` в start-flow.
- Убрать waiver `lib/task/actions/start.ts` из `tools/quality-text/waivers.json`.
- Добавить source-contract/unit проверки, что route/service boundary и PromptContext integration остались на месте.

## Impact

- Затронуты `task`, `llm`, `prompt-context`, `code-readability`, `testing-layer`.
- Runtime behavior не должен измениться.
- Live credentials не нужны.

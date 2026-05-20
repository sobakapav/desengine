## Why

Нужна единая релизная метка для потока разнородных changes, которые входят в один выпуск от 20 мая 2026.

## What Changes

- Введён release change `release-2026-05-20-day`.
- В релиз добавлены:
  - `dispatcher-task-hints`
  - `dispatcher-code-quality-text-subsystem`
  - `dispatcher-ui-kit`
  - `implement-prompts-njk-templating`
  - `implement-check-prompt-context`
  - `fix-hide-ui-kit-switcher-access`
  - `fix-default-image-inspector-enabled`
- Привязка выполнена через поле metadata `release_ref`.

## Impact

- Улучшается релизная трассируемость между независимыми changes.
- Иерархия `parent_change` не меняется: release используется только как метка.

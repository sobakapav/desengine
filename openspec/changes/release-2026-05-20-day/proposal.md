## Why

Нужна единая релизная метка для потока разнородных changes, которые входят в один выпуск от 20 мая 2026.

## What Changes

- Введён release change `release-2026-05-20-day`.
- В релиз добавлены:
  - `dispatcher-task-hints-templating`
  - `dispatcher-code-quality-text-subsystem`
  - `dispatcher-project-ui-kit-switching`
- Привязка выполнена через поле metadata `release_ref`.

## Impact

- Улучшается релизная трассируемость между независимыми changes.
- Иерархия `parent_change` не меняется: release используется только как метка.

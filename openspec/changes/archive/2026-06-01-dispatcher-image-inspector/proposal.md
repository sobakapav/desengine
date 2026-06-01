## Why

Нужен отдельный dispatcher под `focus-features` для системной проработки инспектора картинок, чтобы fixes и implement-изменения шли в одном тактическом контуре и не терялись среди других feature-веток.

## What Changes

- Фиксируется `dispatcher-image-inspector` как дочерний change к `focus-features`.
- В dispatcher концентрируется проработка инспектора картинок.
- Все исполнительские changes по этой теме (fix/implement) привязываются к этому dispatcher.

## Non-goals

- Не выполняем кодовые изменения самим dispatcher.
- Не меняем install-critical инфраструктуру.

## Acceptance Criteria

- `dispatcher-image-inspector` отображается в `npm run os` под `focus-features`.
- `fix-default-image-inspector-enabled` отображается как дочерний к `dispatcher-image-inspector`.

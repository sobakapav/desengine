## Context

`@monaco-editor/react` и сам `monaco-editor` используют cancelable async-path'ы. При размонтировании, смене модели или отмене внутренней операции браузер может получить rejection с `name === "Canceled"` и `message === "Canceled"`. В dev-окружении такой rejection иногда всплывает как overlay, хотя для пользователя это не означает фактическую поломку редактора.

Нужен локальный boundary-fix: не переписывать Monaco, а отфильтровать только тот rejection, который по форме и стеку совпадает с benign Monaco cancellation.

## Goals

- Ограничить suppression только Monaco cancellation noise.
- Не подавлять ошибки без Monaco stack или с другим типом/сообщением.
- Оставить listener локальным для пути, где действительно смонтирован редактор Monaco.

## Decisions

1. Фильтр опирается одновременно на `name`, `message` и Monaco-стек.
   - Одного текста `Canceled` недостаточно, иначе есть риск скрыть посторонние ошибки.

2. Listener живёт только рядом с Monaco editor wrapper.
   - Это не глобальная политика приложения, а локальная защита editor-path.

3. Regression guard состоит из двух частей.
   - Unit-проверка фиксирует форму benign cancellation.
   - Source-contract проверка фиксирует установку и cleanup `unhandledrejection` listener в Monaco wrapper.

## Risks / Trade-offs

- Слишком узкий фильтр может пропустить часть benign Monaco cancellation в другой форме.
- Слишком широкий фильтр опасен тем, что скроет реальные ошибки.
- Поэтому change сознательно выбирает узкий контракт и явную проверку по Monaco stack.

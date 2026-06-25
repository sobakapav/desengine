## Контекст

`dispatcher-project` уже зафиксировал project boundary, а предыдущие project/runtime waves ввели `uiMode` как второй переключатель поверх `uiKitId`. В результате один и тот же проект хранит:

- выбранный UI kit;
- отдельный режим materialization этого kit в runtime;
- derived `effectiveUiKitId`, который иногда расходится с выбранным.

Для текущей продуктовой линии это избыточно: пользователь должен выбирать только UI kit проекта, а runtime должен всегда materialize именно этот режим, без `html-tags` ответвления.

## Решение

1. Удалить `uiMode` из канонического `ProjectWorkspace.settings` и из связанных migration payloads.

2. Упростить runtime/prompt/preview contract:
   - `project.uiKitId` остаётся единственным выбором;
   - preview/runtime больше не вычисляет отдельный режим;
   - все payload/query/body поля `uiMode` исчезают.

3. Синхронизировать project UI:
   - project page больше не показывает режим;
   - config surface больше не читает и не пишет `uiMode`;
   - user-facing тексты больше не обещают режимы.

4. Синхронизировать active OpenSpec и runnable/source-contract tests под одно-режимный контракт.
